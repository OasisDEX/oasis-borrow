import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import type { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData.types'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'

export interface AutomationTriggersChange {
  kind: 'automationTriggersData'
  stopLossData: StopLossTriggerData
  autoSellData: AutoBSTriggerData
  autoBuyData: AutoBSTriggerData
  autoTakeProfitData: AutoTakeProfitTriggerData
}
