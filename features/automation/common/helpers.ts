import BigNumber from 'bignumber.js'

export function getInitialVaultCollRatio({
  liquidationRatio,
  collateralizationRatio,
}: {
  liquidationRatio: BigNumber
  collateralizationRatio: BigNumber
}) {
  return new BigNumber(
    liquidationRatio.plus(collateralizationRatio).dividedBy(2).toFixed(2, BigNumber.ROUND_CEIL),
  )
}

export function getIsEditingProtection({
  isStopLossEnabled,
  selectedSLValue,
  startingSlRatio,
  stopLossLevel,
  collateralActive,
  isToCollateral,
}: {
  isStopLossEnabled: boolean
  selectedSLValue: BigNumber
  startingSlRatio: BigNumber
  stopLossLevel: BigNumber
  collateralActive: boolean
  isToCollateral: boolean
}) {
  return (
    (!isStopLossEnabled && !selectedSLValue.eq(startingSlRatio.multipliedBy(100))) ||
    (isStopLossEnabled && !selectedSLValue.eq(stopLossLevel.multipliedBy(100))) ||
    collateralActive !== isToCollateral
  )
}

export function getStartingSlRatio({
  isStopLossEnabled,
  stopLossLevel,
  initialVaultCollRatio,
}: {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  initialVaultCollRatio: BigNumber
}) {
  return isStopLossEnabled ? stopLossLevel : initialVaultCollRatio
}
