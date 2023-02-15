import {
  addAutomationBotTrigger,
  AutomationBotAddTriggerData,
  AutomationBotV2AddTriggerData,
  AutomationBotV2RemoveTriggerData,
} from 'blockchain/calls/automationBot'
import {
  addAutomationBotAggregatorTrigger,
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from 'blockchain/calls/automationBotAggregator'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import {
  AUTO_BUY_FORM_CHANGE,
  AUTO_SELL_FORM_CHANGE,
} from 'features/automation/common/state/autoBSFormChange'
import { AUTO_TAKE_PROFIT_FORM_CHANGE } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { CONSTANT_MULTIPLE_FORM_CHANGE } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/stopLoss/state/StopLossFormChange'

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
