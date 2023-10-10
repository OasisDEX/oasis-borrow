import type BigNumber from 'bignumber.js'
import type { SidebarAutomationStages } from 'features/automation/common/types'
import { one, zero } from 'helpers/zero'

export function checkIfIsEditingStopLoss({
  isStopLossEnabled,
  selectedSLValue,
  stopLossLevel,
  initialSlRatioWhenTriggerDoesntExist,
  isRemoveForm,
  collateralActive,
  isToCollateral,
}: {
  isStopLossEnabled: boolean
  selectedSLValue: BigNumber
  stopLossLevel: BigNumber
  initialSlRatioWhenTriggerDoesntExist: BigNumber
  isRemoveForm: boolean
  collateralActive?: boolean
  isToCollateral?: boolean
}) {
  if (collateralActive === undefined && isToCollateral === undefined) {
    return false
  }

  return (
    (isStopLossEnabled && !selectedSLValue.eq(stopLossLevel.multipliedBy(100))) ||
    !initialSlRatioWhenTriggerDoesntExist.eq(selectedSLValue) ||
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
  return value.minus(min).times(100).div(max.minus(min))
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

export function calculateStepNumber(isConfirmation: boolean, stage: SidebarAutomationStages) {
  if (isConfirmation && stage !== 'txSuccess') return '(2/3)'
  if (stage === 'txInProgress' || stage === 'txSuccess') return '(3/3)'
  return '(1/3)'
}

export function getDynamicStopLossPrice({
  liquidationPrice,
  liquidationRatio,
  stopLossLevel,
}: {
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  stopLossLevel: BigNumber
}) {
  return stopLossLevel.isZero()
    ? zero
    : liquidationPrice.div(liquidationRatio).times(stopLossLevel.div(100))
}

export function getMaxToken({
  liquidationPrice,
  liquidationRatio,
  stopLossLevel,
  lockedCollateral,
  debt,
}: {
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  stopLossLevel: BigNumber
  lockedCollateral: BigNumber
  debt: BigNumber
}) {
  const dynamicStopLossPrice = getDynamicStopLossPrice({
    liquidationPrice,
    liquidationRatio,
    stopLossLevel,
  })

  return dynamicStopLossPrice.isZero()
    ? zero
    : lockedCollateral.times(dynamicStopLossPrice).minus(debt).div(dynamicStopLossPrice)
}

export function getCollateralDuringLiquidation({
  lockedCollateral,
  debt,
  liquidationPrice,
  liquidationPenalty,
}: {
  lockedCollateral: BigNumber
  debt: BigNumber
  liquidationPrice: BigNumber
  liquidationPenalty: BigNumber
}) {
  return lockedCollateral
    .times(liquidationPrice)
    .minus(debt.multipliedBy(one.plus(liquidationPenalty)))
    .div(liquidationPrice)
}
