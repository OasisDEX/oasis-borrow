import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { ExchangeAction } from 'features/exchange/exchange'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { calculatePriceImpact } from 'features/shared/priceImpact'
import {
  calculateCloseToCollateralParams,
  calculateCloseToDaiParams,
  CloseToParams,
  getMultiplyParams,
  LOAN_FEE,
  OAZO_FEE,
} from 'helpers/multiply/calculations'
import { one, zero } from 'helpers/zero'

import { ManageMultiplyVaultState } from './manageMultiplyVault'

// This value ought to be coupled in relation to how much we round the raw debt
// value in the vault (vault.debt)
export const PAYBACK_ALL_BOUND = new BigNumber('0.01')

export interface ManageVaultCalculations {
  maxBuyAmount: BigNumber
  maxBuyAmountUSD: BigNumber

  maxSellAmount: BigNumber
  maxSellAmountUSD: BigNumber

  maxDepositAmount: BigNumber
  maxDepositAmountUSD: BigNumber

  maxPaybackAmount: BigNumber

  maxWithdrawAmountAtCurrentPrice: BigNumber
  maxWithdrawAmountAtNextPrice: BigNumber
  maxWithdrawAmount: BigNumber
  maxWithdrawAmountUSD: BigNumber

  maxGenerateAmountAtCurrentPrice: BigNumber
  maxGenerateAmountAtNextPrice: BigNumber
  maxGenerateAmount: BigNumber

  maxLegalCollateralizationRatio: BigNumber

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

  impact: BigNumber
  multiply: BigNumber
  afterMultiply: BigNumber

  maxCollRatio: BigNumber
  liquidationPriceCurrentPriceDifference: BigNumber | undefined
  loanFee: BigNumber
  oazoFee: BigNumber
  fees: BigNumber
  netValueUSD: BigNumber
  afterNetValueUSD: BigNumber
  buyingPower: BigNumber
  buyingPowerUSD: BigNumber
  afterBuyingPower: BigNumber
  afterBuyingPowerUSD: BigNumber

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
  oneInchAmount: BigNumber
}

export const MAX_COLL_RATIO = new BigNumber(5)

export const defaultManageMultiplyVaultCalculations: ManageVaultCalculations = {
  maxBuyAmount: zero,
  maxBuyAmountUSD: zero,

  maxSellAmount: zero,
  maxSellAmountUSD: zero,

  maxDepositAmount: zero,
  maxDepositAmountUSD: zero,

  maxPaybackAmount: zero,

  maxWithdrawAmountAtCurrentPrice: zero,
  maxWithdrawAmountAtNextPrice: zero,
  maxWithdrawAmount: zero,
  maxWithdrawAmountUSD: zero,

  maxGenerateAmountAtCurrentPrice: zero,
  maxGenerateAmountAtNextPrice: zero,
  maxGenerateAmount: zero,

  maxLegalCollateralizationRatio: MAX_COLL_RATIO,

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

  impact: zero,
  multiply: zero,
  afterMultiply: zero,

  maxCollRatio: MAX_COLL_RATIO,
  liquidationPriceCurrentPriceDifference: undefined,

  loanFee: zero,
  oazoFee: zero,
  fees: zero,

  buyingPower: zero,
  buyingPowerUSD: zero,
  netValueUSD: zero,
  afterBuyingPower: zero,
  afterBuyingPowerUSD: zero,
  afterNetValueUSD: zero,
  oneInchAmount: zero,

  closeToDaiParams: {
    fromTokenAmount: zero,
    toTokenAmount: zero,
    minToTokenAmount: zero,
    oazoFee: zero,
    loanFee: zero,
  },

  closeToCollateralParams: {
    fromTokenAmount: zero,
    toTokenAmount: zero,
    minToTokenAmount: zero,
    oazoFee: zero,
    loanFee: zero,
  },

  afterCloseToDai: zero,
  afterCloseToCollateral: zero,
  afterCloseToCollateralUSD: zero,
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
}: Pick<ManageMultiplyVaultState, 'paybackAmount'> &
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
  paybackAmount,
  generateAmount,
}: Pick<ManageMultiplyVaultState, 'paybackAmount' | 'generateAmount'> &
  Pick<Vault, 'lockedCollateral'>) {
  const amount = paybackAmount
    ? lockedCollateral.plus(paybackAmount)
    : generateAmount
    ? lockedCollateral.minus(generateAmount)
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
}: Pick<ManageMultiplyVaultState, 'shouldPaybackAll' | 'generateAmount' | 'paybackAmount'> &
  Pick<Vault, 'debt'>) {
  if (shouldPaybackAll) return zero

  const amount = generateAmount
    ? debt.plus(generateAmount)
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
}: Pick<ManageMultiplyVaultState, 'afterDebt'> &
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
}: Pick<ManageMultiplyVaultState, 'paybackAmount' | 'shouldPaybackAll' | 'requiredCollRatio'> &
  Pick<Vault, 'lockedCollateral' | 'debt' | 'debtOffset'> &
  Pick<IlkData, 'liquidationRatio'> & { price: BigNumber }) {
  const afterDebt = calculateAfterDebt({ shouldPaybackAll, debt, paybackAmount })
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

function calculateAfterIlkDebtAvailable({ ilkDebtAvailable }: Pick<IlkData, 'ilkDebtAvailable'>) {
  if (ilkDebtAvailable.gt(zero)) {
    return ilkDebtAvailable.gte(zero) ? ilkDebtAvailable : zero
  }
  return zero
}

/*
 * Should return the amount of dai that can be generated given the amount of
 * potential collateral and debt in the vault
 */
function calculateDaiYieldFromCollateral({
  debt,
  liquidationRatio,
  price,
  collateral,
  ilkDebtAvailable,
}: Pick<Vault, 'debt'> &
  Pick<IlkData, 'liquidationRatio' | 'ilkDebtAvailable'> & {
    price: BigNumber
    collateral: BigNumber
  }) {
  const daiYield = collateral.times(price).div(liquidationRatio).minus(debt)

  if (!daiYield.gt(zero)) return zero

  if (daiYield.gt(ilkDebtAvailable)) {
    return calculateAfterIlkDebtAvailable({
      ilkDebtAvailable,
    })
  }

  return daiYield
}

/*
 * Should return the maximum amount of dai that can be generated in context
 * of what collateral currently exists and is being deposited as well as the
 * debt already existing in the vault.
 *
 * It should also not exceed the debt ceiling for that ilk and also account
 * for the accrued interest should the vault debt be non-zero
 */
function calculateMaxGenerateAmount({
  paybackAmount,
  debt,
  debtOffset,
  lockedCollateral,
  liquidationRatio,
  price,
  ilkDebtAvailable,
}: Pick<ManageMultiplyVaultState, 'paybackAmount'> &
  Pick<Vault, 'debtOffset' | 'debt' | 'lockedCollateral'> &
  Pick<IlkData, 'liquidationRatio' | 'ilkDebtAvailable'> & {
    price: BigNumber
  }) {
  const afterLockedCollateral = calculateAfterLockedCollateral({
    lockedCollateral,
    paybackAmount,
  })

  return calculateDaiYieldFromCollateral({
    ilkDebtAvailable,
    collateral: afterLockedCollateral,
    price,
    liquidationRatio,
    debt: debt.plus(debtOffset),
  })
}

function calculateMultiply({
  debt,
  lockedCollateralUSD,
}: {
  debt: BigNumber
  lockedCollateralUSD: BigNumber
}) {
  return lockedCollateralUSD.div(lockedCollateralUSD.minus(debt))
}

export function getVaultChange({
  requiredCollRatio,
  depositAmount,
  paybackAmount,
  generateAmount,
  withdrawAmount,
  slippage,

  currentCollateralPrice,
  marketPrice,
  debt,
  lockedCollateral,

  FF,
  OF,
}: {
  requiredCollRatio: BigNumber | undefined
  depositAmount: BigNumber
  paybackAmount: BigNumber
  generateAmount: BigNumber
  withdrawAmount: BigNumber

  currentCollateralPrice: BigNumber
  marketPrice: BigNumber
  debt: BigNumber
  lockedCollateral: BigNumber
  slippage: BigNumber

  FF: BigNumber
  OF: BigNumber
}) {
  if (requiredCollRatio) {
    return getMultiplyParams(
      currentCollateralPrice,
      marketPrice,
      slippage,
      debt,
      lockedCollateral,
      requiredCollRatio,
      depositAmount,
      paybackAmount,
      generateAmount,
      withdrawAmount,
      FF,
      OF,
    )
  } else {
    return {
      debtDelta: generateAmount.minus(paybackAmount),
      collateralDelta: depositAmount.minus(withdrawAmount),
      loanFee: zero,
      oazoFee: zero,
    }
  }
}

export function applyManageVaultCalculations(
  state: ManageMultiplyVaultState,
): ManageMultiplyVaultState {
  const {
    balanceInfo: { collateralBalance, daiBalance },
    ilkData: { liquidationRatio, ilkDebtAvailable },
    priceInfo: { currentCollateralPrice, nextCollateralPrice },
    vault: { lockedCollateral, debt, debtOffset, lockedCollateralUSD, liquidationPrice },
    requiredCollRatio,
    quote,
    swap,
    slippage,
    depositAmount = zero,
    paybackAmount = zero,
    generateAmount = zero,
    withdrawAmount = zero,
    otherAction,
    originalEditingStage,
    closeVaultTo,
  } = state

  const vaultHasZeroCollateral = lockedCollateral.eq(zero)
  const isCloseAction = originalEditingStage === 'otherActions' && otherAction === 'closeVault'

  const marketPrice =
    swap?.status === 'SUCCESS'
      ? swap.tokenPrice
      : quote?.status === 'SUCCESS'
      ? quote.tokenPrice
      : undefined
  const marketPriceMaxSlippage = marketPrice ? marketPrice.times(slippage.plus(1)) : undefined

  const prices = {
    marketPrice,
    marketPriceMaxSlippage,
  }

  const impact =
    quote?.status === 'SUCCESS' && marketPrice
      ? calculatePriceImpact(quote.tokenPrice, marketPrice)
      : zero

  // TODO implement slider bounds for adjust position
  // getMaxPossibleCollRatioOrMax(
  //   debtFloor,
  //   zero)

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)

  const shouldPaybackAll = determineShouldPaybackAll({
    paybackAmount,
    debt,
    daiBalance,
    debtOffset,
  })

  const maxWithdrawAmountAtCurrentPrice = calculateMaxWithdrawAmount({
    debt,
    debtOffset,
    liquidationRatio,
    lockedCollateral,
    price: currentCollateralPrice,
    shouldPaybackAll,
  })

  const maxWithdrawAmountAtNextPrice = calculateMaxWithdrawAmount({
    debt,
    debtOffset,
    liquidationRatio,
    lockedCollateral,
    price: nextCollateralPrice,
    shouldPaybackAll,
  })

  const maxWithdrawAmount = BigNumber.min(
    maxWithdrawAmountAtCurrentPrice,
    maxWithdrawAmountAtNextPrice,
  )
  const maxWithdrawAmountUSD = maxWithdrawAmount.times(currentCollateralPrice)

  const maxPaybackAmount = daiBalance.lt(debt) ? daiBalance : debt

  const maxInputAmounts = {
    maxDepositAmount,
    maxDepositAmountUSD,

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
    return { ...state, ...defaultManageMultiplyVaultCalculations, ...maxInputAmounts, ...prices }
  }

  const {
    debtDelta: borrowedDaiAmount,
    collateralDelta: collateralDeltaNonClose,
    loanFee: loanFeeNonClose,
    oazoFee: oazoFeeNonClose,
  } = getVaultChange({
    currentCollateralPrice,
    marketPrice,
    slippage,
    debt,
    lockedCollateral,
    requiredCollRatio,
    depositAmount,
    paybackAmount,
    generateAmount,
    withdrawAmount,
    OF: OAZO_FEE,
    FF: LOAN_FEE,
  })

  const oneInchAmount = borrowedDaiAmount.gt(zero)
    ? borrowedDaiAmount.times(one.minus(OAZO_FEE))
    : collateralDeltaNonClose.times(-1)

  const closeToDaiParams = calculateCloseToDaiParams(
    marketPrice,
    OAZO_FEE,
    LOAN_FEE,
    lockedCollateral,
    slippage,
    debt.plus(debtOffset),
  )

  const closeToCollateralParams = calculateCloseToCollateralParams(
    marketPrice,
    OAZO_FEE,
    LOAN_FEE,
    debt.plus(debtOffset),
    slippage,
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

  const fees = BigNumber.sum(loanFee, oazoFee)

  const afterDebt = isCloseAction ? zero : debt.plus(borrowedDaiAmount).plus(loanFee)

  const afterLockedCollateral = isCloseAction ? zero : lockedCollateral.plus(collateralDelta)
  const afterLockedCollateralUSD = afterLockedCollateral.times(currentCollateralPrice)

  const afterCollateralizationRatio = vaultHasZeroCollateral
    ? zero
    : afterLockedCollateralUSD.div(afterDebt)

  const multiply = vaultHasZeroCollateral ? zero : calculateMultiply({ debt, lockedCollateralUSD })
  const afterMultiply = vaultHasZeroCollateral
    ? zero
    : isCloseAction
    ? one
    : calculateMultiply({
        debt: afterDebt,
        lockedCollateralUSD: afterLockedCollateralUSD,
      })

  const afterLiquidationPrice = vaultHasZeroCollateral
    ? zero
    : currentCollateralPrice.times(liquidationRatio).div(afterCollateralizationRatio)

  const exchangeAction = collateralDelta.isNegative() ? 'SELL_COLLATERAL' : 'BUY_COLLATERAL'

  const afterLockedCollateralUSDAtNextPrice = afterLockedCollateral.times(nextCollateralPrice)

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

  const afterFreeCollateral = isCloseAction
    ? zero
    : calculateAfterFreeCollateral({
        lockedCollateral: afterLockedCollateral,
        backingCollateral: afterBackingCollateral,
      })

  const afterFreeCollateralAtNextPrice = calculateAfterFreeCollateral({
    lockedCollateral: afterLockedCollateral,
    backingCollateral: afterBackingCollateralAtNextPrice,
  })

  const daiYieldFromTotalCollateral = isCloseAction
    ? zero
    : calculateDaiYieldFromCollateral({
        ilkDebtAvailable,
        collateral: afterLockedCollateral,
        price: currentCollateralPrice,
        liquidationRatio,
        debt: afterDebt,
      })

  const daiYieldFromTotalCollateralAtNextPrice = calculateDaiYieldFromCollateral({
    ilkDebtAvailable,
    collateral: afterLockedCollateral,
    price: nextCollateralPrice,
    liquidationRatio,
    debt: afterDebt,
  })

  const afterCollateralizationRatioAtNextPrice =
    afterLockedCollateralUSDAtNextPrice.gt(zero) && afterDebt.gt(zero)
      ? afterLockedCollateralUSDAtNextPrice.div(afterDebt)
      : zero

  const liquidationPriceCurrentPriceDifference = !liquidationPrice.isZero()
    ? one.minus(liquidationPrice.div(currentCollateralPrice))
    : undefined

  const collateralizationRatioAtNextPrice =
    lockedCollateral.gt(zero) && debt.gt(zero)
      ? lockedCollateral.times(nextCollateralPrice).div(debt)
      : zero

  const afterCollateralBalance = collateralBalance.minus(depositAmount)

  const netValueUSD = lockedCollateral.times(marketPrice).minus(debt)
  const afterNetValueUSD = isCloseAction
    ? zero
    : afterLockedCollateral.times(marketPrice).minus(afterDebt)

  const { collateralDelta: buyingPower } = getVaultChange({
    currentCollateralPrice,
    marketPrice,
    slippage,
    debt,
    lockedCollateral,
    requiredCollRatio: liquidationRatio,
    depositAmount: zero,
    paybackAmount: zero,
    generateAmount: zero,
    withdrawAmount: zero,
    OF: OAZO_FEE,
    FF: LOAN_FEE,
  })

  const { collateralDelta: afterBuyingPower } = isCloseAction
    ? { collateralDelta: zero }
    : getVaultChange({
        currentCollateralPrice,
        marketPrice,
        slippage,
        debt: afterDebt,
        lockedCollateral: afterLockedCollateral,
        requiredCollRatio: liquidationRatio,
        depositAmount: zero,
        paybackAmount: zero,
        generateAmount: zero,
        withdrawAmount: zero,
        OF: OAZO_FEE,
        FF: LOAN_FEE,
      })

  const maxGenerateAmountAtCurrentPrice = calculateMaxGenerateAmount({
    debt: debt,
    debtOffset,
    ilkDebtAvailable,
    liquidationRatio,
    lockedCollateral: lockedCollateral.plus(collateralDelta),
    price: currentCollateralPrice,
  })

  const maxGenerateAmountAtNextPrice = calculateMaxGenerateAmount({
    debt: debt,
    debtOffset,
    ilkDebtAvailable,
    liquidationRatio,
    lockedCollateral: lockedCollateral.plus(collateralDelta),
    price: nextCollateralPrice,
  })

  const maxGenerateAmount = BigNumber.minimum(
    maxGenerateAmountAtCurrentPrice,
    maxGenerateAmountAtNextPrice,
  )
  maxInputAmounts.maxGenerateAmountAtCurrentPrice = maxGenerateAmountAtCurrentPrice
  maxInputAmounts.maxGenerateAmount = maxGenerateAmount
  maxInputAmounts.maxGenerateAmountAtNextPrice = maxGenerateAmountAtNextPrice

  const buyingPowerUSD = buyingPower.times(currentCollateralPrice)
  const afterBuyingPowerUSD = afterBuyingPower.times(currentCollateralPrice)
  const collateralDeltaUSD = collateralDelta.times(marketPrice)

  const afterCloseToDai = closeToDaiParams.minToTokenAmount.minus(debt)

  const afterCloseToCollateral = lockedCollateral.minus(closeToCollateralParams.fromTokenAmount)
  const afterCloseToCollateralUSD = afterCloseToCollateral.times(marketPrice)

  return {
    ...state,
    ...maxInputAmounts,
    ...prices,

    afterDebt,
    afterLockedCollateral,
    afterLockedCollateralUSD,
    afterCollateralizationRatio,

    multiply,
    afterMultiply,
    afterLiquidationPrice,
    exchangeAction,

    afterCollateralizationRatioAtNextPrice,
    afterFreeCollateral,
    afterFreeCollateralAtNextPrice,
    afterBackingCollateral,
    afterBackingCollateralAtNextPrice,
    liquidationPriceCurrentPriceDifference,
    collateralizationRatioAtNextPrice,

    daiYieldFromTotalCollateral,
    daiYieldFromTotalCollateralAtNextPrice,

    impact,
    loanFee,
    oazoFee,
    fees,

    debtDelta: borrowedDaiAmount,
    collateralDelta,

    afterCollateralBalance,
    shouldPaybackAll,

    netValueUSD,
    afterNetValueUSD,
    buyingPower,
    buyingPowerUSD,
    afterBuyingPower,
    afterBuyingPowerUSD,
    collateralDeltaUSD,

    closeToDaiParams,
    closeToCollateralParams,
    afterCloseToDai,
    afterCloseToCollateral,
    afterCloseToCollateralUSD,
    oneInchAmount,
  }
}
