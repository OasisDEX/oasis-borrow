import { BigNumber } from 'bignumber.js'
import { isNullish } from 'helpers/functions'
import { zero } from 'helpers/zero'

import { ManageVaultState, PAYBACK_ALL_BOUND } from './manageVault'

export function applyManageVaultCalculations(state: ManageVaultState): ManageVaultState {
  const {
    depositAmount,
    generateAmount,
    withdrawAmount,
    paybackAmount,
    balanceInfo: { collateralBalance, daiBalance },
    ilkData: { liquidationRatio, ilkDebtAvailable },
    priceInfo: { currentCollateralPrice, nextCollateralPrice },
    vault: { lockedCollateral, debt, debtOffset, freeCollateral, freeCollateralAtNextPrice },
  } = state

  const maxWithdrawAmount = BigNumber.minimum(freeCollateral, freeCollateralAtNextPrice)
  const maxWithdrawAmountUSD = maxWithdrawAmount.times(currentCollateralPrice)

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)

  const daiYieldFromTotalCollateral = lockedCollateral
    .plus(depositAmount || zero)
    .times(currentCollateralPrice)
    .div(liquidationRatio)
    .minus(debt.plus(debtOffset))

  const daiYieldFromTotalCollateralAtNextPrice = lockedCollateral
    .plus(depositAmount || zero)
    .times(nextCollateralPrice || currentCollateralPrice)
    .div(liquidationRatio)
    .minus(debt.plus(debtOffset))

  const maxGenerateAmountCurrentPrice = daiYieldFromTotalCollateral.gt(ilkDebtAvailable)
    ? ilkDebtAvailable
    : daiYieldFromTotalCollateral

  const maxGenerateAmountNextPrice = daiYieldFromTotalCollateralAtNextPrice.gt(ilkDebtAvailable)
    ? ilkDebtAvailable
    : daiYieldFromTotalCollateralAtNextPrice

  const maxGenerateAmount = BigNumber.minimum(
    maxGenerateAmountCurrentPrice,
    maxGenerateAmountNextPrice,
  ).gt(zero)
    ? BigNumber.minimum(maxGenerateAmountCurrentPrice, maxGenerateAmountNextPrice)
    : zero

  const maxPaybackAmount = daiBalance.lt(debt) ? daiBalance : debt

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
  const afterLockedCollateralUSDAtNextPrice = afterLockedCollateral.times(
    nextCollateralPrice || currentCollateralPrice,
  )

  const afterDebt = generateAmount
    ? debt.plus(generateAmount)
    : paybackAmount
    ? debt.minus(paybackAmount)
    : debt

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

  const afterBackingCollateral = afterDebt.isPositive()
    ? afterDebt.times(liquidationRatio).div(currentCollateralPrice)
    : zero

  const afterFreeCollateral = afterLockedCollateral.isPositive()
    ? afterLockedCollateral.minus(afterBackingCollateral)
    : zero

  const afterDaiYieldFromTotalCollateral = afterLockedCollateralUSD
    .div(liquidationRatio)
    .minus(afterDebt)

  const afterMaxGenerateAmountCurrentPrice = afterDaiYieldFromTotalCollateral.gt(ilkDebtAvailable)
    ? ilkDebtAvailable
    : afterDaiYieldFromTotalCollateral

  const depositAndWithdrawAmountsEmpty = isNullish(depositAmount) && isNullish(withdrawAmount)
  const generateAndPaybackAmountsEmpty = isNullish(generateAmount) && isNullish(paybackAmount)

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
    afterDebt,
    maxPaybackAmount,
    shouldPaybackAll,
    daiYieldFromTotalCollateral,
    daiYieldFromTotalCollateralAtNextPrice,
    depositAndWithdrawAmountsEmpty,
    generateAndPaybackAmountsEmpty,
  }
}
