import BigNumber from 'bignumber.js'

export function getIsEditingStopLoss({
  isStopLossEnabled,
  selectedSLValue,
  stopLossLevel,
  isRemoveForm,
  collateralActive,
  isToCollateral,
}: {
  isStopLossEnabled: boolean
  selectedSLValue: BigNumber
  stopLossLevel: BigNumber
  isRemoveForm: boolean
  collateralActive?: boolean
  isToCollateral?: boolean
}) {
  if (collateralActive === undefined && isToCollateral === undefined) {
    return false
  }

  return (
    (isStopLossEnabled && !selectedSLValue.eq(stopLossLevel.multipliedBy(100))) ||
    collateralActive !== isToCollateral ||
    isRemoveForm
  )
}

export function getStartingSlRatio({
  isStopLossEnabled,
  stopLossLevel,
  initialStopLossSelected,
}: {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  initialStopLossSelected: BigNumber
}) {
  return isStopLossEnabled ? stopLossLevel : initialStopLossSelected
}

export function getSliderPercentageFill({
  value,
  min,
  max,
}: {
  value: BigNumber
  min: BigNumber
  max: BigNumber
}) {
  return value
    .minus(min.times(100))
    .div(max.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN).div(100).minus(min))
}
