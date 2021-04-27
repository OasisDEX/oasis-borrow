import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'

import { ManageVaultState } from './manageVault'
import { ManageVaultErrorMessage, ManageVaultWarningMessage } from './manageVaultValidations'

interface CalcDaiYieldFromTotalCollateralProps {
  price: BigNumber
  debt: BigNumber
  ratio: BigNumber
  collateral: BigNumber
}
export function calcDaiYieldFromCollateral({
  price,
  ratio,
  debt,
  collateral,
}: CalcDaiYieldFromTotalCollateralProps) {
  return collateral.times(price).div(ratio).minus(debt)
}

// This value ought to be coupled in relation to how much we round the raw debt
// value in the vault (vault.debt)
export const PAYBACK_ALL_BOUND = new BigNumber('0.01')

export interface ManageVaultCalculations {
  errorMessages: ManageVaultErrorMessage[]
  warningMessages: ManageVaultWarningMessage[]
  maxDepositAmount: BigNumber
  maxDepositAmountUSD: BigNumber
  maxWithdrawAmount: BigNumber
  maxWithdrawAmountUSD: BigNumber
  maxGenerateAmount: BigNumber
  maxGenerateAmountCurrentPrice: BigNumber
  maxGenerateAmountNextPrice: BigNumber
  maxPaybackAmount: BigNumber
  daiYieldFromTotalCollateral: BigNumber
  daiYieldFromTotalCollateralAtNextPrice: BigNumber
  collateralAvailableToWithdraw: BigNumber
  afterDebt: BigNumber
  afterLiquidationPrice: BigNumber
  afterCollateralizationRatio: BigNumber
  afterCollateralizationRatioAtNextPrice: BigNumber
  afterFreeCollateral: BigNumber
  afterFreeCollateralAtNextPrice: BigNumber
  afterMaxGenerateAmountCurrentPrice: BigNumber

  shouldPaybackAll: boolean
}

export const defaultManageVaultCalculations: ManageVaultCalculations = {
  errorMessages: [],
  warningMessages: [],
  maxDepositAmount: zero,
  maxDepositAmountUSD: zero,
  maxWithdrawAmount: zero,
  maxWithdrawAmountUSD: zero,
  maxGenerateAmount: zero,
  maxGenerateAmountCurrentPrice: zero,
  maxGenerateAmountNextPrice: zero,
  maxPaybackAmount: zero,
  afterDebt: zero,
  afterCollateralizationRatio: zero,
  afterCollateralizationRatioAtNextPrice: zero,
  afterLiquidationPrice: zero,
  afterFreeCollateral: zero,
  afterFreeCollateralAtNextPrice: zero,
  afterMaxGenerateAmountCurrentPrice: zero,
  daiYieldFromTotalCollateral: zero,
  daiYieldFromTotalCollateralAtNextPrice: zero,
  collateralAvailableToWithdraw: zero,
  shouldPaybackAll: false,
}

export function applyManageVaultCalculations(state: ManageVaultState): ManageVaultState {
  const {
    depositAmount,
    generateAmount,
    withdrawAmount,
    paybackAmount,
    balanceInfo: { collateralBalance, daiBalance },
    ilkData: { liquidationRatio, ilkDebtAvailable },
    priceInfo: { currentCollateralPrice, nextCollateralPrice },
    vault: { lockedCollateral, debt, debtOffset },
  } = state

  const shouldPaybackAll = !!(
    daiBalance.gte(debt) &&
    paybackAmount &&
    paybackAmount.plus(PAYBACK_ALL_BOUND).gte(debt) &&
    !paybackAmount.gt(debt)
  )

  const afterLockedCollateral = depositAmount
    ? lockedCollateral.plus(depositAmount)
    : withdrawAmount
    ? lockedCollateral.minus(withdrawAmount)
    : lockedCollateral

  const afterLockedCollateralUSD = afterLockedCollateral.times(currentCollateralPrice)
  const afterLockedCollateralUSDAtNextPrice = afterLockedCollateral.times(nextCollateralPrice)

  const afterDebt = generateAmount
    ? debt.plus(generateAmount)
    : paybackAmount
    ? debt.minus(paybackAmount)
    : debt

  const afterBackingCollateral = afterDebt.isPositive()
    ? afterDebt
        .plus(!shouldPaybackAll ? debtOffset : zero)
        .times(liquidationRatio)
        .div(currentCollateralPrice)
    : zero

  const afterBackingCollateralAtNextPrice = afterDebt.isPositive()
    ? afterDebt
        .plus(!shouldPaybackAll ? debtOffset : zero)
        .times(liquidationRatio)
        .div(nextCollateralPrice)
    : zero

  const afterFreeCollateral = lockedCollateral
    .plus(depositAmount || zero)
    .minus(afterBackingCollateral)
    .isPositive()
    ? lockedCollateral.plus(depositAmount || zero).minus(afterBackingCollateral)
    : zero

  const afterFreeCollateralAtNextPrice = lockedCollateral
    .plus(depositAmount || zero)
    .minus(afterBackingCollateral)
    .isPositive()
    ? lockedCollateral.plus(depositAmount || zero).minus(afterBackingCollateralAtNextPrice)
    : zero

  const collateralAvailableToWithdraw = afterLockedCollateral.minus(afterBackingCollateral)

  const maxWithdrawAmount = BigNumber.minimum(
    afterFreeCollateral,
    afterFreeCollateralAtNextPrice,
  ).isPositive()
    ? BigNumber.minimum(afterFreeCollateral, afterFreeCollateralAtNextPrice)
    : zero

  const maxWithdrawAmountUSD = maxWithdrawAmount.times(currentCollateralPrice)

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)

  const daiYieldFromTotalCollateral = calcDaiYieldFromCollateral({
    collateral: lockedCollateral.plus(depositAmount || zero),
    price: currentCollateralPrice,
    ratio: liquidationRatio,
    debt: debt,
  })

  const daiYieldFromTotalCollateralAtNextPrice = calcDaiYieldFromCollateral({
    collateral: lockedCollateral.plus(depositAmount || zero),
    price: nextCollateralPrice,
    ratio: liquidationRatio,
    debt: debt,
  })

  const maxGenerateAmountCurrentPrice = daiYieldFromTotalCollateral.gt(ilkDebtAvailable)
    ? ilkDebtAvailable
    : daiYieldFromTotalCollateral

  const maxGenerateAmountNextPrice = daiYieldFromTotalCollateralAtNextPrice.gt(ilkDebtAvailable)
    ? ilkDebtAvailable
    : daiYieldFromTotalCollateralAtNextPrice

  const maxGenerateAmount = BigNumber.minimum(
    maxGenerateAmountCurrentPrice,
    maxGenerateAmountNextPrice,
  )
    .minus(debtOffset)
    .gt(zero)
    ? BigNumber.minimum(maxGenerateAmountCurrentPrice, maxGenerateAmountNextPrice).minus(debtOffset)
    : zero

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
    afterDebt && afterDebt.gt(zero) && afterLockedCollateral.gt(zero)
      ? afterDebt.times(liquidationRatio).div(afterLockedCollateral)
      : zero

  const afterDaiYieldFromTotalCollateral = afterLockedCollateralUSD
    .div(liquidationRatio)
    .minus(afterDebt)

  const afterMaxGenerateAmountCurrentPrice = afterDaiYieldFromTotalCollateral.gt(ilkDebtAvailable)
    ? ilkDebtAvailable
    : afterDaiYieldFromTotalCollateral

  return {
    ...state,
    maxDepositAmount,
    maxDepositAmountUSD,
    maxWithdrawAmount,
    maxWithdrawAmountUSD,
    maxGenerateAmount,
    maxGenerateAmountCurrentPrice,
    maxGenerateAmountNextPrice,
    afterMaxGenerateAmountCurrentPrice,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    afterLiquidationPrice,
    afterFreeCollateral,
    afterFreeCollateralAtNextPrice,
    afterDebt,
    maxPaybackAmount,
    daiYieldFromTotalCollateral,
    daiYieldFromTotalCollateralAtNextPrice,
    collateralAvailableToWithdraw,

    shouldPaybackAll,
  }
}
