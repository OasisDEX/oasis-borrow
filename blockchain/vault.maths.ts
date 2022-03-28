import BigNumber from 'bignumber.js'

import { HOUR, SECONDS_PER_YEAR } from '../components/constants'
import { one, zero } from '../helpers/zero'

export function buildPosition(
  lockedCollateral: BigNumber,
  currentPrice: BigNumber,
  nextPrice: BigNumber,
  debtScalingFactor: BigNumber,
  normalizedDebt: BigNumber,
  stabilityFee: BigNumber,
  liquidationRatio: BigNumber,
  ilkDebtAvailable: BigNumber,
  collateralizationDangerThreshold: BigNumber,
  collateralizationWarningThreshold: BigNumber,
) {
  const lockedCollateralUSD = lockedCollateral.times(currentPrice)
  const lockedCollateralUSDAtNextPrice = nextPrice
    ? lockedCollateral.times(nextPrice)
    : currentPrice

  const debt = debtScalingFactor.times(normalizedDebt)

  const debtOffset = !debt.isZero()
    ? debt
        .times(one.plus(stabilityFee.div(SECONDS_PER_YEAR)).pow(HOUR * 5))
        .minus(debt)
        .dp(18, BigNumber.ROUND_DOWN)
    : new BigNumber('1e-18')

  const backingCollateral = debt.times(liquidationRatio).div(currentPrice)

  const backingCollateralAtNextPrice = debt.times(liquidationRatio).div(nextPrice)
  const backingCollateralUSD = backingCollateral.times(currentPrice)
  const backingCollateralUSDAtNextPrice = backingCollateralAtNextPrice.times(nextPrice)

  const freeCollateral = backingCollateral.gte(lockedCollateral)
    ? zero
    : lockedCollateral.minus(backingCollateral)
  const freeCollateralAtNextPrice = backingCollateralAtNextPrice.gte(lockedCollateral)
    ? zero
    : lockedCollateral.minus(backingCollateralAtNextPrice)

  const freeCollateralUSD = freeCollateral.times(currentPrice)
  const freeCollateralUSDAtNextPrice = freeCollateralAtNextPrice.times(nextPrice)

  const collateralizationRatio = debt.isZero() ? zero : lockedCollateralUSD.div(debt)
  const collateralizationRatioAtNextPrice = debt.isZero()
    ? zero
    : lockedCollateralUSDAtNextPrice.div(debt)

  const maxAvailableDebt = lockedCollateralUSD.div(liquidationRatio)
  const maxAvailableDebtAtNextPrice = lockedCollateralUSDAtNextPrice.div(liquidationRatio)

  const availableDebt = debt.lt(lockedCollateralUSD.div(liquidationRatio))
    ? maxAvailableDebt.minus(debt)
    : zero

  const availableDebtAtNextPrice = debt.lt(maxAvailableDebtAtNextPrice)
    ? maxAvailableDebtAtNextPrice.minus(debt)
    : zero

  const liquidationPrice = collateralPriceAtRatio({
    colRatio: liquidationRatio,
    lockedCollateral,
    vaultDebt: debt,
  })

  const daiYieldFromLockedCollateral = availableDebt.lt(ilkDebtAvailable)
    ? availableDebt
    : ilkDebtAvailable.gt(zero)
    ? ilkDebtAvailable
    : zero
  const atRiskLevelWarning =
    collateralizationRatio.gte(collateralizationDangerThreshold) &&
    collateralizationRatio.lt(collateralizationWarningThreshold)

  const atRiskLevelDanger =
    collateralizationRatio.gte(liquidationRatio) &&
    collateralizationRatio.lt(collateralizationDangerThreshold)

  const underCollateralized =
    !collateralizationRatio.isZero() && collateralizationRatio.lt(liquidationRatio)

  const atRiskLevelWarningAtNextPrice =
    collateralizationRatioAtNextPrice.gte(collateralizationDangerThreshold) &&
    collateralizationRatioAtNextPrice.lt(collateralizationWarningThreshold)

  const atRiskLevelDangerAtNextPrice =
    collateralizationRatioAtNextPrice.gte(liquidationRatio) &&
    collateralizationRatioAtNextPrice.lt(collateralizationDangerThreshold)

  const underCollateralizedAtNextPrice =
    !collateralizationRatioAtNextPrice.isZero() &&
    collateralizationRatioAtNextPrice.lt(liquidationRatio)
  return {
    lockedCollateralUSD,
    lockedCollateralUSDAtNextPrice,
    debt,
    debtOffset,
    backingCollateral,
    backingCollateralAtNextPrice,
    backingCollateralUSD,
    backingCollateralUSDAtNextPrice,
    freeCollateral,
    freeCollateralAtNextPrice,
    freeCollateralUSD,
    freeCollateralUSDAtNextPrice,
    collateralizationRatio,
    collateralizationRatioAtNextPrice,
    availableDebt,
    availableDebtAtNextPrice,
    liquidationPrice,
    daiYieldFromLockedCollateral,
    atRiskLevelWarning,
    atRiskLevelDanger,
    underCollateralized,
    atRiskLevelWarningAtNextPrice,
    atRiskLevelDangerAtNextPrice,
    underCollateralizedAtNextPrice,
  }
}

type CollateralPriceAtRatioThresholdArgs = {
  colRatio: BigNumber
  lockedCollateral: BigNumber
  vaultDebt: BigNumber
}

// the collateral price at which the collateral ratio is reached
export function collateralPriceAtRatio({
  colRatio,
  lockedCollateral,
  vaultDebt,
}: CollateralPriceAtRatioThresholdArgs): BigNumber {
  return lockedCollateral.eq(zero) ? zero : vaultDebt.times(colRatio).div(lockedCollateral)
}
