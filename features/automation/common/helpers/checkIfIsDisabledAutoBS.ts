import type { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange.types'
import type { SidebarAutomationStages } from 'features/automation/common/types'
import type { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'

export function checkIfIsDisabledAutoBS({
  isProgressStage,
  isOwner,
  isEditing,
  isAddForm,
  autoBSState,
  stage,
}: {
  isProgressStage?: boolean
  isOwner: boolean
  isEditing: boolean
  isAddForm: boolean
  autoBSState: AutoBSFormChange
  stage: SidebarVaultStages | SidebarAutomationStages
}) {
  return (
    (isProgressStage ||
      !isOwner ||
      !isEditing ||
      (isAddForm &&
        (autoBSState.execCollRatio.isZero() ||
          autoBSState.targetCollRatio.isZero() ||
          (autoBSState.withThreshold &&
            (autoBSState.maxBuyOrMinSellPrice === undefined ||
              autoBSState.maxBuyOrMinSellPrice?.isZero()))))) &&
    stage !== 'txSuccess'
  )
}
