import { addAutomationBotTrigger } from 'blockchain/calls/automationBot.constants'
import type {
  AutomationBotAddTriggerData,
  AutomationBotV2AddTriggerData,
  AutomationBotV2RemoveTriggerData,
} from 'blockchain/calls/automationBot.types'
import type {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from 'blockchain/calls/automationBotAggregator'
import { addAutomationBotAggregatorTrigger } from 'blockchain/calls/automationBotAggregator'
import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import { AUTO_TAKE_PROFIT_FORM_CHANGE } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange.constants'
import { CONSTANT_MULTIPLE_FORM_CHANGE } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange.constants'
import { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/stopLoss/state/StopLossFormChange.constants'

import { AUTO_BUY_FORM_CHANGE, AUTO_SELL_FORM_CHANGE } from './state/autoBSFormChange.constants'

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

export const addTransactionMap = {
  [CONSTANT_MULTIPLE_FORM_CHANGE]: addAutomationBotAggregatorTrigger,
  [AUTO_BUY_FORM_CHANGE]: addAutomationBotTrigger,
  [AUTO_SELL_FORM_CHANGE]: addAutomationBotTrigger,
  [STOP_LOSS_FORM_CHANGE]: addAutomationBotTrigger,
  [AUTO_TAKE_PROFIT_FORM_CHANGE]: addAutomationBotTrigger,
}
