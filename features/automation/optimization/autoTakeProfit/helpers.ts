import type { SidebarAutomationStages } from 'features/automation/common/types'
import type { AutoTakeProfitFormChange } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import type { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import type { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'

export function checkIfIsEditingAutoTakeProfit({
  autoTakeProfitState,
  autoTakeProfitTriggerData,
  isRemoveForm,
}: {
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  autoTakeProfitState: AutoTakeProfitFormChange
  isRemoveForm: boolean
}) {
  return (
    (!autoTakeProfitTriggerData.isTriggerEnabled && autoTakeProfitState.isEditing) ||
    (autoTakeProfitTriggerData.isTriggerEnabled &&
      (autoTakeProfitTriggerData.isToCollateral !== autoTakeProfitState.toCollateral ||
        !autoTakeProfitTriggerData.executionPrice.isEqualTo(autoTakeProfitState.executionPrice))) ||
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
  stage: SidebarVaultStages | SidebarAutomationStages
}) {
  return (isProgressStage || !isOwner || !isEditing) && stage !== 'txSuccess'
}
