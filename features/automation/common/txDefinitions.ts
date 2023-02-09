import {
  AutomationBotAddTriggerData,
  AutomationBotV2AddTriggerData,
  AutomationBotV2RemoveTriggerData,
} from 'blockchain/calls/automationBot'
import {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from 'blockchain/calls/automationBotAggregator'
import { TransactionDef } from 'blockchain/calls/callsHelpers'

export type AutomationAddTriggerData =
  | AutomationBotAddTriggerData
  | AutomationBotAddAggregatorTriggerData
  | AutomationBotV2AddTriggerData

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
