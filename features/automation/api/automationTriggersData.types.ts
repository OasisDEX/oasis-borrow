import type { NetworkIds } from 'blockchain/networks'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import type { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData.types'
import type { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData.types'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'

export interface TriggerRecord {
  triggerId: number
  groupId?: number
  commandAddress: string
  executionParams: string // bytes triggerData from TriggerAdded event
}

export interface TriggersData {
  isAutomationDataLoaded: boolean
  isAutomationEnabled: boolean
  chainId: NetworkIds
  triggers?: TriggerRecord[]
}

export interface AutomationTriggersChange {
  kind: 'automationTriggersData'
  stopLossData: StopLossTriggerData
  autoSellData: AutoBSTriggerData
  autoBuyData: AutoBSTriggerData
  constantMultipleData: ConstantMultipleTriggerData
  autoTakeProfitData: AutoTakeProfitTriggerData
}
