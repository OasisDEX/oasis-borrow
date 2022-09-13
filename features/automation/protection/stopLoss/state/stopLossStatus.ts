import { getIsEditingStopLoss } from 'features/automation/protection/stopLoss/helpers'
import { StopLossFormChange } from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'

interface GetStopLossStatusParams {
  stopLossTriggerData: StopLossTriggerData
  stopLossState: StopLossFormChange
  isRemoveForm: boolean
}

interface StopLossStatus {
  isEditing: boolean
}

export function getStopLossStatus({
  stopLossTriggerData,
  stopLossState,
  isRemoveForm,
}: GetStopLossStatusParams): StopLossStatus {
  const isEditing = getIsEditingStopLoss({
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    selectedSLValue: stopLossState.stopLossLevel,
    stopLossLevel: stopLossTriggerData.stopLossLevel,
    collateralActive: stopLossState.collateralActive,
    isToCollateral: stopLossTriggerData.isToCollateral,
    isRemoveForm,
  })

  return {
    isEditing,
  }
}
