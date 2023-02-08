import { addAutomationBotTrigger } from 'blockchain/calls/automationBot'
import { addAutomationBotAggregatorTrigger } from 'blockchain/calls/automationBotAggregator'
import {
  AUTO_BUY_FORM_CHANGE,
  AUTO_SELL_FORM_CHANGE,
} from 'features/automation/common/state/autoBSFormChange'
import {
  AutomationAddTriggerData,
  AutomationAddTriggerTxDef,
  AutomationRemoveTriggerData,
  AutomationRemoveTriggerTxDef,
} from 'features/automation/common/txDefinitions'
import { AUTO_TAKE_PROFIT_FORM_CHANGE } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { CONSTANT_MULTIPLE_FORM_CHANGE } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/stopLoss/state/StopLossFormChange'

export const TX_DATA_CHANGE = 'TX_DATA_CHANGE'

export type TxPayloadChange =
  | {
      data: AutomationAddTriggerData | AutomationRemoveTriggerData
      transaction: AutomationAddTriggerTxDef | AutomationRemoveTriggerTxDef
    }
  | undefined

export type TxPayloadChangeAction =
  | {
      type: 'tx-data'
      transaction: AutomationAddTriggerTxDef | AutomationRemoveTriggerTxDef
      data: AutomationAddTriggerData | AutomationRemoveTriggerData
    }
  | { type: 'reset' }

export function gasEstimationReducer(
  state: TxPayloadChange,
  action: TxPayloadChangeAction,
): TxPayloadChange {
  switch (action.type) {
    case 'tx-data':
      return { data: action.data, transaction: action.transaction }
    case 'reset':
      return undefined
    default:
      return state
  }
}

export const addTransactionMap = {
  [CONSTANT_MULTIPLE_FORM_CHANGE]: addAutomationBotAggregatorTrigger,
  [AUTO_BUY_FORM_CHANGE]: addAutomationBotTrigger,
  [AUTO_SELL_FORM_CHANGE]: addAutomationBotTrigger,
  [STOP_LOSS_FORM_CHANGE]: addAutomationBotTrigger,
  [AUTO_TAKE_PROFIT_FORM_CHANGE]: addAutomationBotTrigger,
}
