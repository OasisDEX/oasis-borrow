import type {
  AutomationBotAddTriggerData,
  AutomationBotV2AddTriggerData,
  AutomationBotV2RemoveTriggerData,
} from 'blockchain/calls/automationBot.types'
import type {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from 'blockchain/calls/automationBotAggregator.types'
import type { TransactionDef } from 'blockchain/calls/callsHelpers'

export type AutomationAddTriggerData =
  | AutomationBotAddTriggerData
  | AutomationBotAddAggregatorTriggerData
  | AutomationBotV2AddTriggerData

export type AutomationAddTriggerLambda = {
  data: string
  to: string
  encodedTriggerData: string
  triggerTxData: string
}

export type AutomationAddTriggerTxDef =
  | TransactionDef<AutomationBotAddTriggerData>
  | TransactionDef<AutomationBotAddAggregatorTriggerData>
  | TransactionDef<AutomationBotV2AddTriggerData>

export type AutomationRemoveTriggerData =
  | AutomationBotRemoveTriggersData
  | AutomationBotV2RemoveTriggerData

export type AutomationRemoveTriggerTxDef =
  | TransactionDef<AutomationBotRemoveTriggersData>
  | TransactionDef<AutomationBotV2RemoveTriggerData>
