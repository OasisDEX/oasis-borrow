import BigNumber from 'bignumber.js'

import { HOUR, SECONDS_PER_YEAR } from '../components/constants'
import { one, zero } from '../helpers/zero'

const defaultDebtOffset = new BigNumber('1e-18')

type BuildPositionArgs = {
  collateral: BigNumber
  currentPrice: BigNumber
  nextPrice: BigNumber
  debtScalingFactor: BigNumber
  normalizedDebt: BigNumber
  stabilityFee: BigNumber
  liquidationRatio: BigNumber
  ilkDebtAvailable: BigNumber
  collateralizationDangerThreshold: BigNumber
  collateralizationWarningThreshold: BigNumber
  minActiveColRatio: BigNumber // col ratio cannot be manually decreased below this ratio, but vault is not liquidated until liquidation ratio
  originationFee: BigNumber
}

export function buildPosition({
  collateral,
  currentPrice,
  nextPrice,
  debtScalingFactor,
  normalizedDebt,
  stabilityFee,
  liquidationRatio,
  ilkDebtAvailable,
  collateralizationDangerThreshold,
  collateralizationWarningThreshold,
  minActiveColRatio, // col ratio cannot be manually decreased below this ratio, but vault is not liquidated until liquidation ratio
  originationFee,
}: BuildPositionArgs) {
  const lockedCollateralUSD = collateral.times(currentPrice)
  const lockedCollateralUSDAtNextPrice = nextPrice ? collateral.times(nextPrice) : currentPrice

  const debt = debtScalingFactor.times(normalizedDebt)

  const debtOffset = !debt.isZero()
    ? debt
        .times(one.plus(stabilityFee.div(SECONDS_PER_YEAR)).pow(HOUR * 5))
        .minus(debt)
        .dp(18, BigNumber.ROUND_DOWN)
    : defaultDebtOffset

  const backingCollateral = debt.times(minActiveColRatio).div(currentPrice)

  const backingCollateralAtNextPrice = debt.times(minActiveColRatio).div(nextPrice)
  const backingCollateralUSD = backingCollateral.times(currentPrice)
  const backingCollateralUSDAtNextPrice = backingCollateralAtNextPrice.times(nextPrice)

  const freeCollateral = backingCollateral.gte(collateral)
    ? zero
    : collateral.minus(backingCollateral)
  const freeCollateralAtNextPrice = backingCollateralAtNextPrice.gte(collateral)
    ? zero
    : collateral.minus(backingCollateralAtNextPrice)

  const freeCollateralUSD = freeCollateral.times(currentPrice)
  const freeCollateralUSDAtNextPrice = freeCollateralAtNextPrice.times(nextPrice)

  const collateralizationRatio = debt.isZero() ? zero : lockedCollateralUSD.div(debt)
  const collateralizationRatioAtNextPrice = debt.isZero()
    ? zero
    : lockedCollateralUSDAtNextPrice.div(debt)

  const maxAvailableDebt = lockedCollateralUSD.div(minActiveColRatio)
  const maxAvailableDebtAtNextPrice = lockedCollateralUSDAtNextPrice.div(minActiveColRatio)

  const availableDebt = debt.lt(lockedCollateralUSD.div(minActiveColRatio))
    ? maxAvailableDebt.minus(debt)
    : zero

  const availableDebtAtNextPrice = debt.lt(maxAvailableDebtAtNextPrice)
    ? maxAvailableDebtAtNextPrice.minus(debt)
    : zero

  const liquidationPrice = collateralPriceAtRatio({
    colRatio: liquidationRatio,
    collateral,
    vaultDebt: debt,
  })

  const daiYieldFromLockedCollateralWithoutOriginationFee = availableDebt.lt(ilkDebtAvailable)
    ? availableDebt
    : ilkDebtAvailable.gt(zero)
    ? ilkDebtAvailable
    : zero

  const daiYieldFromLockedCollateral = daiYieldFromLockedCollateralWithoutOriginationFee.div(
    originationFee.plus(1),
  )

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
  collateral: BigNumber
  vaultDebt: BigNumber
}

// the collateral price at which the collateral ratio is reached
export function collateralPriceAtRatio({
  colRatio,
  collateral,
  vaultDebt,
}: CollateralPriceAtRatioThresholdArgs): BigNumber {
  return collateral.isZero() || vaultDebt.isZero()
    ? zero
    : vaultDebt.times(colRatio).div(collateral)
}
