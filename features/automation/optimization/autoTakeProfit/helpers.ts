import { amountFromWei } from 'blockchain/utils'
import { AutoTakeProfitFormChange } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'

export function checkIfIsEditingAutoTakeProfit({
  autoTakeProfitState,
  autoTakeProfitTriggerData,
  isRemoveForm,
  token,
}: {
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  autoTakeProfitState: AutoTakeProfitFormChange
  isRemoveForm: boolean
  token: string
}) {
  return (
    (!autoTakeProfitTriggerData.isTriggerEnabled && autoTakeProfitState.isEditing) ||
    (autoTakeProfitTriggerData.isTriggerEnabled &&
      (autoTakeProfitTriggerData.isToCollateral !== autoTakeProfitState.toCollateral ||
        !amountFromWei(autoTakeProfitTriggerData.executionPrice, token).isEqualTo(
          autoTakeProfitState.executionPrice,
        ))) ||
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
