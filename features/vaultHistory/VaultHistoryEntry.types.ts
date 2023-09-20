import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import type { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData.types'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'
import type { AutomationEvent } from 'features/vaultHistory/vaultHistoryEvents.types'

export interface AutomationEntryProps {
  event: AutomationEvent
  isAddOrRemoveEvent: boolean
  isUpdateEvent: boolean
  addOrRemoveTriggersData: (AutoBSTriggerData | StopLossTriggerData | AutoTakeProfitTriggerData)[]
}
