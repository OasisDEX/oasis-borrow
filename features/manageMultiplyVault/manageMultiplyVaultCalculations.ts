import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { ExchangeAction } from 'features/exchange/exchange'
import { BalanceInfo } from 'features/shared/balanceInfo'
import {
  getMaxPossibleCollRatioOrMax,
  getMultiplyParams,
  LOAN_FEE,
  MULTIPLY_FEE,
} from 'helpers/multiply/calculations'
import { one, zero } from 'helpers/zero'
import { SLIPPAGE } from './manageMultiplyQuote'

import { ManageMultiplyVaultState } from './manageMultiplyVault'

// This value ought to be coupled in relation to how much we round the raw debt
// value in the vault (vault.debt)
export const PAYBACK_ALL_BOUND = new BigNumber('0.01')

export interface ManageVaultCalculations {
  maxDepositCollateral: BigNumber
  maxDepositCollateralUSD: BigNumber

  maxDepositDai: BigNumber

  maxWithdrawCollateralAtCurrentPrice: BigNumber
  maxWithdrawCollateralAtNextPrice: BigNumber
  maxWithdrawCollateral: BigNumber
  maxWithdrawCollateralUSD: BigNumber

  maxWithdrawDaiAtCurrentPrice: BigNumber
  maxWithdrawDaiAtNextPrice: BigNumber
  maxWithdrawDai: BigNumber

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

  multiply: BigNumber
  afterMultiply: BigNumber

  maxCollRatio: BigNumber
  liquidationPriceCurrentPriceDifference: BigNumber | undefined
  loanFee: BigNumber
  oazoFee: BigNumber
  fees: BigNumber
}

export const MAX_COLL_RATIO = new BigNumber(5)

export const defaultManageVaultCalculations: ManageVaultCalculations = {
  maxDepositCollateral: zero,
  maxDepositCollateralUSD: zero,

  maxDepositDai: zero,

  maxWithdrawCollateralAtCurrentPrice: zero,
  maxWithdrawCollateralAtNextPrice: zero,
  maxWithdrawCollateral: zero,
  maxWithdrawCollateralUSD: zero,

  maxWithdrawDaiAtCurrentPrice: zero,
  maxWithdrawDaiAtNextPrice: zero,
  maxWithdrawDai: zero,

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

  multiply: zero,
  afterMultiply: zero,

  maxCollRatio: MAX_COLL_RATIO,
  liquidationPriceCurrentPriceDifference: undefined,

  loanFee: zero,
  oazoFee: zero,
  fees: zero,
}

/*
 * Determines if on the basis of the user input the users intention to pay back
 * all of their debt.
 */
function determineShouldPaybackAll({
  depositDaiAmount,
  debt,
  debtOffset,
  daiBalance,
}: Pick<ManageMultiplyVaultState, 'depositDaiAmount'> &
  Pick<Vault, 'debt' | 'debtOffset'> &
  Pick<BalanceInfo, 'daiBalance'>): boolean {
  return (
    debt.gt(zero) &&
    daiBalance.gte(debt.plus(debtOffset)) &&
    !!(
      depositDaiAmount &&
      depositDaiAmount.plus(PAYBACK_ALL_BOUND).gte(debt) &&
      !depositDaiAmount.gt(debt)
    )
  )
}

/*
 * Should return the expected lockedCollateral on the basis of the amount
 * of collateral that is being deposited or withdrawn. Must return a
 * non-negative value
 */
function calculateAfterLockedCollateral({
  lockedCollateral,
  depositDaiAmount,
  withdrawDaiAmount,
}: Pick<ManageMultiplyVaultState, 'depositDaiAmount' | 'withdrawDaiAmount'> &
  Pick<Vault, 'lockedCollateral'>) {
  const amount = depositDaiAmount
    ? lockedCollateral.plus(depositDaiAmount)
    : withdrawDaiAmount
    ? lockedCollateral.minus(withdrawDaiAmount)
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
  withdrawDaiAmount,
  depositDaiAmount,
  debt,
}: Pick<ManageMultiplyVaultState, 'shouldPaybackAll' | 'withdrawDaiAmount' | 'depositDaiAmount'> &
  Pick<Vault, 'debt'>) {
  if (shouldPaybackAll) return zero

  const amount = withdrawDaiAmount
    ? debt.plus(withdrawDaiAmount)
    : depositDaiAmount
    ? debt.minus(depositDaiAmount)
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
  depositDaiAmount,
  shouldPaybackAll,
  lockedCollateral,
  debt,
  debtOffset,
  liquidationRatio,
  price,
}: Pick<ManageMultiplyVaultState, 'depositDaiAmount' | 'shouldPaybackAll' | 'requiredCollRatio'> &
  Pick<Vault, 'lockedCollateral' | 'debt' | 'debtOffset'> &
  Pick<IlkData, 'liquidationRatio'> & { price: BigNumber }) {
  const afterDebt = calculateAfterDebt({ shouldPaybackAll, debt, depositDaiAmount })
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
function calculateMaxWithdrawDaiAmount({
  depositDaiAmount,
  debt,
  debtOffset,
  lockedCollateral,
  liquidationRatio,
  price,
  ilkDebtAvailable,
}: Pick<ManageMultiplyVaultState, 'depositDaiAmount'> &
  Pick<Vault, 'debtOffset' | 'debt' | 'lockedCollateral'> &
  Pick<IlkData, 'liquidationRatio' | 'ilkDebtAvailable'> & {
    price: BigNumber
  }) {
  const afterLockedCollateral = calculateAfterLockedCollateral({
    lockedCollateral,
    depositDaiAmount,
  })

  return calculateDaiYieldFromCollateral({
    ilkDebtAvailable,
    collateral: afterLockedCollateral,
    price,
    liquidationRatio,
    debt: debt.plus(debtOffset),
  })
}

export function getVaultChange({
  requiredCollRatio,
  depositCollateralAmount,
  depositDaiAmount,
  withdrawDaiAmount,
  withdrawCollateralAmount,
  slippage,

  currentCollateralPrice,
  marketPrice,
  debt,
  lockedCollateral,

  FF,
  OF,
}: {
  requiredCollRatio: BigNumber | undefined
  depositCollateralAmount: BigNumber
  depositDaiAmount: BigNumber
  withdrawDaiAmount: BigNumber
  withdrawCollateralAmount: BigNumber

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
      depositCollateralAmount,
      depositDaiAmount,
      withdrawDaiAmount,
      withdrawCollateralAmount,
      FF,
      OF,
    )
  }

  return {
    debtDelta: withdrawDaiAmount.minus(depositDaiAmount),
    collateralDelta: depositCollateralAmount.minus(withdrawCollateralAmount),
    loanFee: zero,
    oazoFee: zero,
  }
}

export function applyManageVaultCalculations(
  state: ManageMultiplyVaultState,
): ManageMultiplyVaultState {
  const {
    balanceInfo: { collateralBalance, daiBalance },
    ilkData: { liquidationRatio, ilkDebtAvailable, debtFloor },
    priceInfo: { currentCollateralPrice, nextCollateralPrice },
    vault: {
      lockedCollateral,
      debt,
      debtOffset,
      lockedCollateralUSD,
      liquidationPrice,
      collateralizationRatio,
      freeCollateral,
      freeCollateralAtNextPrice,
      daiYieldFromLockedCollateral,
    },
    requiredCollRatio,
    inputAmountsEmpty,
    quote,
    swap,
    slippage,
    depositCollateralAmount = zero,
    depositDaiAmount = zero,
    withdrawDaiAmount = zero,
    withdrawCollateralAmount = zero,
  } = state

  const marketPrice =
    swap?.status === 'SUCCESS'
      ? swap.tokenPrice
      : quote?.status === 'SUCCESS'
      ? quote.tokenPrice
      : undefined
  const marketPriceMaxSlippage = marketPrice ? marketPrice.times(slippage.plus(1)) : undefined

  // getMaxPossibleCollRatioOrMax(
  //   debtFloor,
  //   zero)

  const maxDepositCollateral = collateralBalance
  const maxDepositCollateralUSD = collateralBalance.times(currentCollateralPrice)

  const maxWithdrawCollateralAtCurrentPrice = freeCollateral
  const maxWithdrawCollateralAtNextPrice = freeCollateralAtNextPrice
  const maxWithdrawCollateral = BigNumber.min(
    maxWithdrawCollateralAtCurrentPrice,
    maxWithdrawCollateralAtNextPrice,
  )
  const maxWithdrawCollateralUSD = maxWithdrawCollateral.times(currentCollateralPrice)

  const maxDepositDai = zero

  const maxWithdrawDaiAtCurrentPrice = zero
  const maxWithdrawDaiAtNextPrice = zero
  const maxWithdrawDai = daiYieldFromLockedCollateral.minus(debtOffset)

  const maxInputAmounts = {
    maxDepositCollateral,
    maxDepositCollateralUSD,

    maxWithdrawCollateralAtCurrentPrice,
    maxWithdrawCollateralAtNextPrice,
    maxWithdrawCollateral,
    maxWithdrawCollateralUSD,

    maxDepositDai,

    maxWithdrawDaiAtCurrentPrice,
    maxWithdrawDaiAtNextPrice,
    maxWithdrawDai,
  }

  console.log({ inputAmountsEmpty })

  if (!marketPrice || !marketPriceMaxSlippage || inputAmountsEmpty) {
    return { ...state, ...defaultManageVaultCalculations, ...maxInputAmounts }
  }

  const { debtDelta, collateralDelta, loanFee, oazoFee } = getVaultChange({
    currentCollateralPrice,
    marketPrice,
    slippage: SLIPPAGE,
    debt,
    lockedCollateral,
    requiredCollRatio,
    depositCollateralAmount,
    depositDaiAmount,
    withdrawDaiAmount,
    withdrawCollateralAmount,
    OF: MULTIPLY_FEE,
    FF: LOAN_FEE,
  })

  const fees = BigNumber.sum(loanFee, oazoFee)

  const afterDebt = debt.plus(debtDelta).plus(loanFee)

  const afterLockedCollateral = lockedCollateral.plus(collateralDelta)
  const afterLockedCollateralUSD = afterLockedCollateral.times(currentCollateralPrice)

  const afterCollateralizationRatio = afterLockedCollateralUSD.div(afterDebt)

  const multiply = lockedCollateralUSD.div(lockedCollateralUSD.minus(debt))
  const afterMultiply = afterLockedCollateralUSD.div(afterLockedCollateralUSD.minus(afterDebt))

  const afterLiquidationPrice = currentCollateralPrice
    .times(liquidationRatio)
    .div(afterCollateralizationRatio)

  const exchangeAction = collateralDelta.isNegative() ? 'SELL_COLLATERAL' : 'BUY_COLLATERAL'

  const shouldPaybackAll = determineShouldPaybackAll({
    depositDaiAmount,
    debt,
    daiBalance,
    debtOffset,
  })
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

  const afterFreeCollateral = calculateAfterFreeCollateral({
    lockedCollateral: afterLockedCollateral,
    backingCollateral: afterBackingCollateral,
  })

  const afterFreeCollateralAtNextPrice = calculateAfterFreeCollateral({
    lockedCollateral: afterLockedCollateral,
    backingCollateral: afterBackingCollateralAtNextPrice,
  })

  // const maxWithdrawAmountAtCurrentPrice = calculateMaxWithdrawAmount({
  //   depositDaiAmount,
  //   shouldPaybackAll,
  //   lockedCollateral,
  //   debt,
  //   debtOffset,
  //   liquidationRatio,
  //   price: currentCollateralPrice,
  // })

  // const maxWithdrawAmountAtNextPrice = calculateMaxWithdrawAmount({
  //   paybackAmount,
  //   shouldPaybackAll,
  //   lockedCollateral,
  //   debt,
  //   debtOffset,
  //   liquidationRatio,
  //   price: nextCollateralPrice,
  // })

  // const maxWithdrawAmount = BigNumber.minimum(
  //   maxWithdrawAmountAtCurrentPrice,
  //   maxWithdrawAmountAtNextPrice,
  // )
  // const maxWithdrawAmountUSD = maxWithdrawAmount.times(currentCollateralPrice)

  // const maxDepositAmount = collateralBalance
  // const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)

  const daiYieldFromTotalCollateral = calculateDaiYieldFromCollateral({
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

  // const maxGenerateAmountAtCurrentPrice = calculateMaxGenerateAmount({
  //   depositAmount,
  //   debt,
  //   debtOffset,
  //   ilkDebtAvailable,
  //   liquidationRatio,
  //   lockedCollateral,
  //   price: currentCollateralPrice,
  // })

  // const maxGenerateAmountAtNextPrice = calculateMaxGenerateAmount({
  //   depositAmount,
  //   debt,
  //   debtOffset,
  //   ilkDebtAvailable,
  //   liquidationRatio,
  //   lockedCollateral,
  //   price: nextCollateralPrice,
  // })

  // const maxGenerateAmount = BigNumber.minimum(
  //   maxGenerateAmountAtCurrentPrice,
  //   maxGenerateAmountAtNextPrice,
  // )

  // const maxPaybackAmount = daiBalance.lt(debt) ? daiBalance : debt

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

  console.log(`

      exchangeAction ${exchangeAction}
  
      AFTER COLL RATIO : ${afterCollateralizationRatio}
      REQUIRED COLL RATO: ${requiredCollRatio}


      REQUIRED COLL RATO:${requiredCollRatio}
      CURRENT COLL RATIO:${collateralizationRatio}

      MARKET PRICE: ${marketPrice}
      MARKET PRICE MAX SLIPPAGE: ${marketPriceMaxSlippage}


      DEBT delta: ${debtDelta} 
      COLLATERAL Delta: ${collateralDelta}


      currentCollateralPrice, ${currentCollateralPrice}
      marketPrice, ${marketPrice}
      SLIPPAGE, ${SLIPPAGE}
      debt, ${debt}
      lockedCollateral, ${lockedCollateral}
      requiredCollRatio, ${requiredCollRatio}

      afterLockedCollateral: ${afterLockedCollateral}
      afterDebt: ${afterDebt}


      afterLiquidationPrice: ${afterLiquidationPrice}


      depositCollateralAmount,: ${depositCollateralAmount}
      depositDaiAmount,: ${depositDaiAmount}
      withdrawDaiAmount,: ${withdrawDaiAmount}
      withdrawCollateralAmount,: ${withdrawCollateralAmount}
      
  `)
  return {
    ...state,
    ...maxInputAmounts,
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

    loanFee,
    oazoFee,
    fees,

    // maxDepositAmount,
    // maxDepositAmountUSD,
    // maxWithdrawAmountAtCurrentPrice,
    // maxWithdrawAmountAtNextPrice,
    // maxWithdrawAmount,
    // maxWithdrawAmountUSD,
    // maxGenerateAmount,
    // maxGenerateAmountAtCurrentPrice,
    // maxGenerateAmountAtNextPrice,
    // afterCollateralBalance,
    // maxPaybackAmount,

    shouldPaybackAll,
  }
}
