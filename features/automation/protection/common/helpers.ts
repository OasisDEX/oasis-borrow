import BigNumber from 'bignumber.js'

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
  collateralActive?: boolean
  isToCollateral?: boolean
}) {
  if (
    (collateralActive === undefined && isToCollateral === undefined) ||
    selectedSLValue.isZero()
  ) {
    return false
  }

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
