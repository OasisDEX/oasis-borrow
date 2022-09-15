import BigNumber from 'bignumber.js'
import { SidebarAutomationStages } from 'features/automation/common/types'

export function checkIfIsEditingStopLoss({
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

export function checkIfIsDisabledStopLoss({
  isAddForm,
  isEditing,
  isOwner,
  isProgressStage,
  maxDebtForSettingStopLoss,
  stage,
}: {
  isAddForm: boolean
  isEditing: boolean
  isOwner: boolean
  isProgressStage: boolean
  maxDebtForSettingStopLoss: boolean
  stage: SidebarAutomationStages
}) {
  return (
    (isProgressStage || !isOwner || !isEditing || (isAddForm && maxDebtForSettingStopLoss)) &&
    stage !== 'txSuccess'
  )
}
