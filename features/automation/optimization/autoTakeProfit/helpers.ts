import { AutoTakeProfitFormChange } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'

export function checkIfIsEditingAutoTakeProfit({
  autoTakeProfitTriggerData,
  autoTakeProfitState,
  isRemoveForm,
}: {
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  autoTakeProfitState: AutoTakeProfitFormChange
  isRemoveForm: boolean
}) {
  return (
    (!autoTakeProfitTriggerData.isTriggerEnabled && autoTakeProfitState.isEditing) ||
    (autoTakeProfitTriggerData.isTriggerEnabled &&
      (!autoTakeProfitTriggerData.executionPrice.isEqualTo(autoTakeProfitState.executionPrice) ||
        !autoTakeProfitTriggerData.triggerId.isZero())) ||
    isRemoveForm
  )
}

export function checkIfIsDisabledAutoTakeProfit({
  isEditing,
  isOwner,
  isProgressStage,
  stage,
}: {
  isEditing: boolean
  isOwner: boolean
  isProgressStage?: boolean
  stage: SidebarVaultStages
}) {
  return (isProgressStage || !isOwner || !isEditing) && stage !== 'txSuccess'
}
