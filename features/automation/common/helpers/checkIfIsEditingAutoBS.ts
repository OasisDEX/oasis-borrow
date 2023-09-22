import type { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange.types'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'

import { resolveMaxBuyOrMinSellPrice } from './resolveMaxBuyOrMinSellPrice'

export function checkIfIsEditingAutoBS({
  autoBSTriggerData,
  autoBSState,
  isRemoveForm,
}: {
  autoBSTriggerData: AutoBSTriggerData
  autoBSState: AutoBSFormChange
  isRemoveForm: boolean
}) {
  const maxBuyOrMinSellPrice = resolveMaxBuyOrMinSellPrice(autoBSTriggerData.maxBuyOrMinSellPrice)

  return (
    (!autoBSTriggerData.isTriggerEnabled && autoBSState.isEditing) ||
    (autoBSTriggerData.isTriggerEnabled &&
      (!autoBSTriggerData.targetCollRatio.isEqualTo(autoBSState.targetCollRatio) ||
        !autoBSTriggerData.execCollRatio.isEqualTo(autoBSState.execCollRatio) ||
        !autoBSTriggerData.maxBaseFeeInGwei.isEqualTo(autoBSState.maxBaseFeeInGwei) ||
        (maxBuyOrMinSellPrice?.toNumber() !== autoBSState.maxBuyOrMinSellPrice?.toNumber() &&
          !autoBSTriggerData.triggerId.isZero()))) ||
    isRemoveForm
  )
}
