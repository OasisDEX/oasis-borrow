import { CloseToParams, getCloseToCollateralParams, getCloseToDaiParams } from '@oasisdex/multiply'
import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { ManageBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { ExchangeAction } from 'features/exchange/exchange'
import { getVaultChange } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { getMaxPossibleCollRatioOrMax } from 'features/multiply/open/pipes/openMultiplyVaultCalculations'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { roundRatioToBeDivisibleByFive } from 'helpers/roundRatioToBeDivisibleByFive'
import { one, zero } from 'helpers/zero'

// This value ought to be coupled in relation to how much we round the raw debt
// value in the vault (vault.debt)
export const PAYBACK_ALL_BOUND = new BigNumber('0.01')

export interface ManageVaultCalculations {
  maxDepositAmount: BigNumber
  maxDepositAmountUSD: BigNumber

  maxPaybackAmount: BigNumber

  maxWithdrawAmountAtCurrentPrice: BigNumber
  maxWithdrawAmountAtNextPrice: BigNumber
  maxWithdrawAmount: BigNumber
  maxWithdrawAmountUSD: BigNumber

  maxGenerateAmount: BigNumber
  maxGenerateAmountAtCurrentPrice: BigNumber
  maxGenerateAmountAtNextPrice: BigNumber

  daiYieldFromTotalCollateral: BigNumber
  daiYieldFromTotalCollateralAtNextPrice: BigNumber
  exchangeAction?: ExchangeAction
  afterDebt: BigNumber
  afterLiquidationPrice: BigNumber
  afterCollateralizationRatio: BigNumber
  collateralizationRatioAtNextPrice: BigNumber
  afterCollateralizationRatioAtNextPrice: BigNumber
  afterFreeCollateral: BigNumber
  afterFreeCollateralAtNextPrice: BigNumber
  afterBackingCollateral: BigNumber
  afterBackingCollateralAtNextPrice: BigNumber
  afterLockedCollateral: BigNumber
  afterLockedCollateralUSD: BigNumber
  afterCollateralBalance: BigNumber
  shouldPaybackAll: boolean

  liquidationPriceCurrentPriceDifference: BigNumber | undefined
  daiYieldFromTotalCollateralWithoutDebt: BigNumber

  debtDelta?: BigNumber
  collateralDelta?: BigNumber
  collateralDeltaUSD?: BigNumber

  marketPrice?: BigNumber
  marketPriceMaxSlippage?: BigNumber

  closeToDaiParams: CloseToParams
  closeToCollateralParams: CloseToParams

  afterCloseToDai: BigNumber
  afterCloseToCollateral: BigNumber
  afterCloseToCollateralUSD: BigNumber

  multiply: BigNumber
  maxCollRatio: BigNumber
  minCollRatio: BigNumber

  oneInchAmount: BigNumber
}

export const MAX_COLL_RATIO = new BigNumber(5)

export const defaultManageVaultCalculations: ManageVaultCalculations = {
  maxDepositAmount: zero,
  maxDepositAmountUSD: zero,

  maxPaybackAmount: zero,

  maxWithdrawAmountAtCurrentPrice: zero,
  maxWithdrawAmountAtNextPrice: zero,
  maxWithdrawAmount: zero,
  maxWithdrawAmountUSD: zero,

  maxGenerateAmount: zero,
  maxGenerateAmountAtCurrentPrice: zero,
  maxGenerateAmountAtNextPrice: zero,

  afterDebt: zero,
  afterCollateralizationRatio: zero,
  collateralizationRatioAtNextPrice: zero,
  afterCollateralizationRatioAtNextPrice: zero,
  afterLiquidationPrice: zero,
  afterFreeCollateral: zero,
  afterFreeCollateralAtNextPrice: zero,
  afterBackingCollateral: zero,
  afterBackingCollateralAtNextPrice: zero,
  afterLockedCollateral: zero,
  afterLockedCollateralUSD: zero,
  afterCollateralBalance: zero,
  daiYieldFromTotalCollateral: zero,
  daiYieldFromTotalCollateralAtNextPrice: zero,
  shouldPaybackAll: false,

  liquidationPriceCurrentPriceDifference: undefined,
  daiYieldFromTotalCollateralWithoutDebt: zero,

  maxCollRatio: MAX_COLL_RATIO,
  minCollRatio: zero,

  oneInchAmount: zero,

  closeToDaiParams: {
    fromTokenAmount: zero,
    toTokenAmount: zero,
    minToTokenAmount: zero,
    borrowCollateral: zero,
    requiredDebt: zero,
    withdrawCollateral: zero,
    oazoFee: zero,
    loanFee: zero,
    skipFL: false,
  },

  closeToCollateralParams: {
    fromTokenAmount: zero,
    toTokenAmount: zero,
    minToTokenAmount: zero,
    borrowCollateral: zero,
    requiredDebt: zero,
    withdrawCollateral: zero,
    oazoFee: zero,
    loanFee: zero,
    skipFL: false,
  },

  afterCloseToDai: zero,
  afterCloseToCollateral: zero,
  afterCloseToCollateralUSD: zero,
  multiply: zero,
}

/*
 * Determines if on the basis of the user input the users intention to pay back
 * all of their debt.
 */
function determineShouldPaybackAll({
  paybackAmount,
  debt,
  debtOffset,
  daiBalance,
}: Pick<ManageBorrowVaultState, 'paybackAmount'> &
  Pick<Vault, 'debt' | 'debtOffset'> &
  Pick<BalanceInfo, 'daiBalance'>): boolean {
  return (
    debt.gt(zero) &&
    daiBalance.gte(debt.plus(debtOffset)) &&
    !!(paybackAmount && paybackAmount.plus(PAYBACK_ALL_BOUND).gte(debt) && !paybackAmount.gt(debt))
  )
}

/*
 * Should return the expected lockedCollateral on the basis of the amount
 * of collateral that is being deposited or withdrawn. Must return a
 * non-negative value
 */
function calculateAfterLockedCollateral({
  lockedCollateral,
  depositAmount,
  withdrawAmount,
}: Pick<ManageBorrowVaultState, 'depositAmount' | 'withdrawAmount'> &
  Pick<Vault, 'lockedCollateral'>) {
  const amount = depositAmount
    ? lockedCollateral.plus(depositAmount)
    : withdrawAmount
    ? lockedCollateral.minus(withdrawAmount)
    : lockedCollateral

  return amount.gte(zero) ? amount : zero
}

/*
 * Should return the expected debt in the vault on the basis of the amount of
 * dai the user is generating or paying back. Must return a non-negative value
 *
 * If the shouldPaybackAll flag is true than we assume that the debt after
 * the transaction will be 0
 */
function calculateAfterDebt({
  shouldPaybackAll,
  generateAmount,
  paybackAmount,
  debt,
  originationFeePercent,
}: Pick<ManageBorrowVaultState, 'shouldPaybackAll' | 'generateAmount' | 'paybackAmount'> &
  Pick<Vault, 'debt'> & { originationFeePercent: BigNumber }) {
  if (shouldPaybackAll) return zero

  const amount = generateAmount
    ? debt.plus(generateAmount.times(originationFeePercent.plus(one)))
    : paybackAmount
    ? debt.minus(paybackAmount)
    : debt

  return amount.gte(zero) ? amount : zero
}

/*
 * Should return the minimum amount of collateral necessary to back the
 * expected debt in the vault on the basis of the amount of dai the user is
 * generating or paying back
 *
 */
function calculateAfterBackingCollateral({
  afterDebt,
  liquidationRatio,
  price,
}: Pick<ManageBorrowVaultState, 'afterDebt'> &
  Pick<IlkData, 'liquidationRatio'> & { price: BigNumber }) {
  if (!afterDebt.gt(zero)) return zero

  return afterDebt.times(liquidationRatio).div(price)
}

/*
 * Should return the maximum amount of collateral that can be possibly
 * withdrawn given the amount of collateral being deposited or withdrawn and
 * the amount of dai being generated or payed back. It should return a
 * non-negative value
 */
function calculateAfterFreeCollateral({
  lockedCollateral,
  backingCollateral,
}: {
  lockedCollateral: BigNumber
  backingCollateral: BigNumber
}) {
  const amount = lockedCollateral.minus(backingCollateral)
  return amount.gte(zero) ? amount : zero
}

/*
 * Should return the maximum amount of collateral that can be withdrawn given
 * the current amount of locked collateral in the vault and factoring in the
 * amount of collateral that would be freed if the user was paying back
 *
 * We must also account for the potential accrual in vault debt which decreases
 * the amount of collateral that can be withdrawn, should we not be paying back
 * all debt at the same time. We do this by increasing the expected debt amount
 * with a small offset amount.
 *
 */
function calculateMaxWithdrawAmount({
  paybackAmount,
  shouldPaybackAll,
  lockedCollateral,
  debt,
  debtOffset,
  liquidationRatio,
  price,
}: Pick<ManageBorrowVaultState, 'paybackAmount' | 'shouldPaybackAll' | 'requiredCollRatio'> &
  Pick<Vault, 'lockedCollateral' | 'debt' | 'debtOffset'> &
  Pick<IlkData, 'liquidationRatio'> & { price: BigNumber }) {
  const afterDebt = calculateAfterDebt({
    shouldPaybackAll,
    debt,
    paybackAmount,
    originationFeePercent: zero,
  })
  const afterDebtWithOffset = afterDebt.gt(zero) ? afterDebt.plus(debtOffset) : afterDebt

  const backingCollateral = calculateAfterBackingCollateral({
    afterDebt: afterDebtWithOffset,
    liquidationRatio,
    price,
  })

  return calculateAfterFreeCollateral({
    lockedCollateral,
    backingCollateral,
  })
}

function calculateAfterIlkDebtAvailable({
  ilkDebtAvailable,
  paybackAmount = zero,
  generateAmount = zero,
  originationFee,
}: Pick<IlkData, 'ilkDebtAvailable'> &
  Pick<ManageBorrowVaultState, 'generateAmount' | 'paybackAmount'> & {
    originationFee: BigNumber
  }) {
  const generateAmountWithOriginationFee = generateAmount.div(originationFee.plus(one))
  if (ilkDebtAvailable.gt(zero)) {
    const amount = ilkDebtAvailable.plus(paybackAmount).minus(generateAmountWithOriginationFee)
    return amount.gte(zero) ? amount : zero
  }
  return zero
}

/*
 * Should return the amount of dai that can be generated given the amount of
 * potential collateral and debt in the vault
 */
function calculateDaiYieldFromCollateral({
  debt,
  minColRatio,
  generateAmount,
  paybackAmount,
  price,
  collateral,
  ilkDebtAvailable,
  originationFee,
}: Pick<ManageBorrowVaultState, 'generateAmount' | 'paybackAmount'> &
  Pick<Vault, 'debt'> &
  Pick<IlkData, 'ilkDebtAvailable'> & {
    price: BigNumber
    collateral: BigNumber
    minColRatio: BigNumber
    originationFee: BigNumber
  }) {
  const daiYield = collateral
    .times(price)
    .div(minColRatio)
    .minus(debt)
    .div(originationFee.plus(one))

  if (!daiYield.gt(zero)) return zero

  if (daiYield.gt(ilkDebtAvailable)) {
    return calculateAfterIlkDebtAvailable({
      generateAmount,
      paybackAmount,
      ilkDebtAvailable,
      originationFee,
    })
  }

  return daiYield
}

/*
 * Should return the maximum amount of dai that can be generated in context
 * of what collateral currently exists and is being deposited aswell as the
 * debt already existng in the vault.
 *
 * It should also not exceed the debt ceiling for that ilk and also account
 * for the accrued interest should the vault debt be non-zero
 */
function calculateMaxGenerateAmount({
  depositAmount,
  generateAmount,
  debt,
  debtOffset,
  lockedCollateral,
  minColRatio,
  price,
  ilkDebtAvailable,
  originationFee,
}: Pick<ManageBorrowVaultState, 'depositAmount' | 'generateAmount'> &
  Pick<Vault, 'debtOffset' | 'debt' | 'lockedCollateral'> &
  Pick<IlkData, 'ilkDebtAvailable'> & {
    price: BigNumber
    originationFee: BigNumber
    minColRatio: BigNumber
  }) {
  const afterLockedCollateral = calculateAfterLockedCollateral({
    lockedCollateral,
    depositAmount,
  })

  return calculateDaiYieldFromCollateral({
    ilkDebtAvailable,
    collateral: afterLockedCollateral,
    price,
    minColRatio,
    debt: debt.plus(debtOffset),
    generateAmount,
    originationFee,
  })
}

export function applyManageVaultCalculations<VaultState extends ManageBorrowVaultState>(
  state: VaultState,
  originationFee: BigNumber,
  minActiveColRatio: BigNumber,
): VaultState {
  const {
    depositAmount = zero,
    depositDaiAmount = zero,
    paybackAmount = zero,
    generateAmount = zero,
    withdrawAmount = zero,
    balanceInfo: { collateralBalance, daiBalance },
    ilkData: { liquidationRatio, ilkDebtAvailable, debtFloor },
    priceInfo: { currentCollateralPrice, nextCollateralPrice },
    vault: { lockedCollateral, debt, debtOffset, liquidationPrice },
    requiredCollRatio,
    swap,
    quote,
    slippage,
    otherAction,
    originalEditingStage,
    closeVaultTo,
  } = state

  const isCloseAction = originalEditingStage === 'otherActions' && otherAction === 'closeVault'

  const shouldPaybackAll = determineShouldPaybackAll({
    paybackAmount,
    debt,
    daiBalance,
    debtOffset,
  })
  const afterLockedCollateral = isCloseAction 
    ? zero 
    : calculateAfterLockedCollateral({
    lockedCollateral,
    depositAmount,
    withdrawAmount,
  })
  const afterLockedCollateralUSD = afterLockedCollateral.times(currentCollateralPrice)
  const afterLockedCollateralUSDAtNextPrice = afterLockedCollateral.times(nextCollateralPrice)
  const afterDebt = isCloseAction 
    ? zero 
    : calculateAfterDebt({
    shouldPaybackAll,
    debt,
    generateAmount,
    paybackAmount,
    originationFeePercent: originationFee,
  })

  const afterBackingCollateral = calculateAfterBackingCollateral({
    afterDebt,
    liquidationRatio,
    price: currentCollateralPrice,
  })

  const afterBackingCollateralAtNextPrice = calculateAfterBackingCollateral({
    afterDebt,
    liquidationRatio,
    price: nextCollateralPrice,
  })

  const afterFreeCollateral = calculateAfterFreeCollateral({
    lockedCollateral: afterLockedCollateral,
    backingCollateral: afterBackingCollateral,
  })

  const afterFreeCollateralAtNextPrice = calculateAfterFreeCollateral({
    lockedCollateral: afterLockedCollateral,
    backingCollateral: afterBackingCollateralAtNextPrice,
  })

  const maxWithdrawAmountAtCurrentPrice = calculateMaxWithdrawAmount({
    paybackAmount,
    shouldPaybackAll,
    lockedCollateral,
    debt,
    debtOffset,
    liquidationRatio,
    price: currentCollateralPrice,
  })

  const maxWithdrawAmountAtNextPrice = calculateMaxWithdrawAmount({
    paybackAmount,
    shouldPaybackAll,
    lockedCollateral,
    debt,
    debtOffset,
    liquidationRatio,
    price: nextCollateralPrice,
  })

  const maxWithdrawAmount = BigNumber.minimum(
    maxWithdrawAmountAtCurrentPrice,
    maxWithdrawAmountAtNextPrice,
  )
  const maxWithdrawAmountUSD = maxWithdrawAmount.times(currentCollateralPrice)

  const maxDepositAmount = collateralBalance
  const maxDepositDaiAmount = daiBalance
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)

  const daiYieldFromTotalCollateral = calculateDaiYieldFromCollateral({
    ilkDebtAvailable,
    collateral: afterLockedCollateral,
    price: currentCollateralPrice,
    minColRatio: minActiveColRatio,
    debt: afterDebt,
    generateAmount,
    paybackAmount,
    originationFee,
  })

  const daiYieldFromTotalCollateralAtNextPrice = calculateDaiYieldFromCollateral({
    ilkDebtAvailable,
    collateral: afterLockedCollateral,
    price: nextCollateralPrice,
    minColRatio: liquidationRatio,
    debt: afterDebt,
    generateAmount,
    paybackAmount,
    originationFee,
  })

  const daiYieldFromTotalCollateralWithoutDebt = calculateDaiYieldFromCollateral({
    ilkDebtAvailable,
    collateral: afterLockedCollateral,
    price: nextCollateralPrice,
    minColRatio: liquidationRatio,
    debt: zero,
    generateAmount,
    paybackAmount,
    originationFee,
  })

  const maxGenerateAmountAtCurrentPrice = calculateMaxGenerateAmount({
    depositAmount,
    debt,
    debtOffset,
    ilkDebtAvailable,
    minColRatio: minActiveColRatio,
    lockedCollateral,
    price: currentCollateralPrice,
    originationFee,
  })

  const maxGenerateAmountAtNextPrice = calculateMaxGenerateAmount({
    depositAmount,
    debt,
    debtOffset,
    ilkDebtAvailable,
    minColRatio: minActiveColRatio,
    lockedCollateral,
    price: nextCollateralPrice,
    originationFee,
  })

  const maxGenerateAmount = BigNumber.minimum(
    maxGenerateAmountAtCurrentPrice,
    maxGenerateAmountAtNextPrice,
  )

  const maxPaybackAmount = daiBalance.lt(debt) ? daiBalance : debt

  const afterCollateralizationRatio =
    afterLockedCollateralUSD.gt(zero) && afterDebt.gt(zero)
      ? afterLockedCollateralUSD.div(afterDebt)
      : zero

  const afterCollateralizationRatioAtNextPrice =
    afterLockedCollateralUSDAtNextPrice.gt(zero) && afterDebt.gt(zero)
      ? afterLockedCollateralUSDAtNextPrice.div(afterDebt)
      : zero

  const afterLiquidationPrice =
    afterDebt.gt(zero) && afterLockedCollateral.gt(zero)
      ? afterDebt.times(liquidationRatio).div(afterLockedCollateral)
      : zero

  const afterCollateralBalance = depositAmount
    ? collateralBalance.minus(depositAmount)
    : withdrawAmount
    ? collateralBalance.plus(withdrawAmount)
    : collateralBalance

  const liquidationPriceCurrentPriceDifference = !liquidationPrice.isZero()
    ? one.minus(liquidationPrice.div(currentCollateralPrice))
    : undefined

  const collateralizationRatioAtNextPrice =
    lockedCollateral.gt(zero) && debt.gt(zero)
      ? lockedCollateral.times(nextCollateralPrice).div(debt)
      : zero

  const marketPrice =
    swap?.status === 'SUCCESS'
      ? swap.tokenPrice
      : quote?.status === 'SUCCESS'
      ? quote.tokenPrice
      : undefined

  const marketPriceMaxSlippage = marketPrice ? marketPrice.div(one.minus(slippage)) : undefined

  const prices = {
    marketPrice,
    marketPriceMaxSlippage,
  }

  const maxInputAmounts = {
    maxDepositAmount,
    maxDepositAmountUSD,
    maxDepositDaiAmount,

    maxWithdrawAmountAtCurrentPrice,
    maxWithdrawAmountAtNextPrice,
    maxWithdrawAmount,
    maxWithdrawAmountUSD,
    maxPaybackAmount,
    maxGenerateAmountAtNextPrice: new BigNumber(0),
    maxGenerateAmountAtCurrentPrice: new BigNumber(0),
    maxGenerateAmount: new BigNumber(0),
  }

  if (!marketPrice || !marketPriceMaxSlippage) {
    return {
      ...state,
      ...defaultManageVaultCalculations,
      ...maxInputAmounts,
      ...prices,
    }
  }

  const depositCollateralAmount = depositDaiAmount.gt(zero)
    ? depositDaiAmount.div(marketPrice)
    : depositAmount

  const {
    debtDelta: borrowedDaiAmount,
    collateralDelta: collateralDeltaNonClose,
    loanFee: loanFeeNonClose,
    skipFL: skipFLNonClose,
    oazoFee: oazoFeeNonClose,
  } = getVaultChange({
    currentCollateralPrice,
    marketPrice,
    slippage,
    debt,
    lockedCollateral,
    requiredCollRatio,
    depositAmount: depositCollateralAmount,
    paybackAmount,
    generateAmount,
    withdrawAmount,
    OF: OAZO_FEE,
    FF: LOAN_FEE,
  })

  const oneInchAmount =
    borrowedDaiAmount.gt(zero) && depositDaiAmount.gt(zero)
      ? borrowedDaiAmount.plus(depositDaiAmount).times(one.minus(OAZO_FEE))
      : borrowedDaiAmount.gt(zero)
      ? borrowedDaiAmount.times(one.minus(OAZO_FEE))
      : collateralDeltaNonClose.times(-1)

  const closeToDaiParams = getCloseToDaiParams(
    // market params
    {
      oraclePrice: currentCollateralPrice,
      marketPrice,
      OF: OAZO_FEE,
      FF: LOAN_FEE,
      slippage,
    },
    // vault info
    {
      currentDebt: debt.plus(debtOffset),
      currentCollateral: lockedCollateral,
    },
  )

  const closeToCollateralParams = getCloseToCollateralParams(
    // market params
    {
      oraclePrice: currentCollateralPrice,
      marketPrice,
      OF: OAZO_FEE,
      FF: LOAN_FEE,
      slippage,
    },
    // vault info
    {
      currentDebt: debt.plus(debtOffset),
      currentCollateral: lockedCollateral,
      minCollRatio: requiredCollRatio,
    },
  )

  const collateralDelta = isCloseAction
    ? closeVaultTo === 'dai'
      ? // negated to indicate that we are performing sell action
        closeToDaiParams.fromTokenAmount.negated()
      : closeToCollateralParams.fromTokenAmount.negated()
    : collateralDeltaNonClose

  const oazoFee = isCloseAction
  ? closeVaultTo === 'dai'
    ? closeToDaiParams.oazoFee
    : closeToCollateralParams.oazoFee
  : oazoFeeNonClose

  const loanFee = isCloseAction
  ? closeVaultTo === 'dai'
    ? closeToDaiParams.loanFee
    : closeToCollateralParams.loanFee
  : loanFeeNonClose

  const skipFL = isCloseAction
    ? closeVaultTo === 'dai'
      ? closeToDaiParams.skipFL
      : closeToCollateralParams.skipFL
    : skipFLNonClose

  const fees = BigNumber.sum(loanFee, oazoFee)

  const exchangeAction = collateralDelta.isNegative() ? 'SELL_COLLATERAL' : 'BUY_COLLATERAL'

  const afterCloseToDai = closeToDaiParams.minToTokenAmount.minus(debt)

  const afterCloseToCollateral = lockedCollateral.minus(closeToCollateralParams.fromTokenAmount)
  const afterCloseToCollateralUSD = afterCloseToCollateral.times(marketPrice)

  const collRatioAfterDepositCollateral = roundRatioToBeDivisibleByFive(
    lockedCollateral.plus(depositAmount).times(currentCollateralPrice).div(debt),
    BigNumber.ROUND_DOWN,
  )

  const collRatioAfterDepositDai = roundRatioToBeDivisibleByFive(
    lockedCollateral
      .plus(depositDaiAmount.div(marketPrice))
      .times(currentCollateralPrice)
      .div(debt),
    BigNumber.ROUND_DOWN,
  )

  const maxCollRatioDepositAmount = getMaxPossibleCollRatioOrMax(
    debt.gt(0) ? debtFloor.plus(debt) : debtFloor,
    debt.gt(0) ? depositAmount : depositAmount.plus(lockedCollateral),
    currentCollateralPrice,
    marketPriceMaxSlippage,
    liquidationRatio,
    debt.gt(0) ? collRatioAfterDepositCollateral : zero,
  )

  const maxCollRatioDepositDaiAmount = getMaxPossibleCollRatioOrMax(
    debt.gt(0) ? debtFloor.plus(debt) : debtFloor,
    debt.gt(0)
      ? depositDaiAmount.div(marketPrice)
      : depositDaiAmount.div(marketPrice).plus(lockedCollateral),
    currentCollateralPrice,
    marketPriceMaxSlippage,
    liquidationRatio,
    debt.gt(0) ? collRatioAfterDepositDai : zero,
  )

  const maxCollRatio = depositAmount.gt(zero)
    ? maxCollRatioDepositAmount
    : depositDaiAmount.gt(zero)
    ? maxCollRatioDepositDaiAmount
    : MAX_COLL_RATIO

  const minCollRatioWithdrawAmount = roundRatioToBeDivisibleByFive(
    lockedCollateral.minus(withdrawAmount).times(currentCollateralPrice).div(debt),
    BigNumber.ROUND_UP,
  )

  const minCollRatioGenerateAmount = roundRatioToBeDivisibleByFive(
    lockedCollateral
      .times(currentCollateralPrice)
      .minus(generateAmount.div(marketPriceMaxSlippage).times(currentCollateralPrice))
      .div(debt),
    BigNumber.ROUND_UP,
  )

  const minCollRatio = withdrawAmount.gt(zero)
    ? minCollRatioWithdrawAmount
    : generateAmount.gt(zero)
    ? minCollRatioGenerateAmount
    : liquidationRatio

  return {
    ...state,
    maxDepositAmount,
    maxDepositAmountUSD,
    maxWithdrawAmountAtCurrentPrice,
    maxWithdrawAmountAtNextPrice,
    maxWithdrawAmount,
    maxWithdrawAmountUSD,
    maxGenerateAmount,
    maxGenerateAmountAtCurrentPrice,
    maxGenerateAmountAtNextPrice,

    afterCollateralizationRatio,
    liquidationPriceCurrentPriceDifference,
    collateralizationRatioAtNextPrice,

    afterDebt,
    afterLockedCollateral,
    afterLockedCollateralUSD,

    multiply: zero,
    afterLiquidationPrice,
    exchangeAction,

    afterCollateralizationRatioAtNextPrice,
    afterFreeCollateral,
    afterFreeCollateralAtNextPrice,
    afterBackingCollateral,
    afterBackingCollateralAtNextPrice,

    maxPaybackAmount,

    daiYieldFromTotalCollateral,
    daiYieldFromTotalCollateralAtNextPrice,
    daiYieldFromTotalCollateralWithoutDebt,

    afterCollateralBalance,
    shouldPaybackAll,
    maxCollRatio,
    minCollRatio,

    closeToDaiParams,
    closeToCollateralParams,
    afterCloseToDai,
    afterCloseToCollateral,
    afterCloseToCollateralUSD,
    oneInchAmount,
  }
}
