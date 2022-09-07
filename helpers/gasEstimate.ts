import {
  addAutomationBotTrigger,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import {
  addAutomationBotAggregatorTrigger,
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from 'blockchain/calls/automationBotAggregator'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import {
  BASIC_BUY_FORM_CHANGE,
  BASIC_SELL_FORM_CHANGE,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { CONSTANT_MULTIPLE_FORM_CHANGE } from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/common/UITypes/StopLossFormChange'

export const TX_DATA_CHANGE = 'TX_DATA_CHANGE'

interface AutoAddTriggerChange {
  data: AutomationBotAddTriggerData | AutomationBotAddAggregatorTriggerData
  transaction:
    | TransactionDef<AutomationBotAddTriggerData>
    | TransactionDef<AutomationBotAddAggregatorTriggerData>
}

interface AutoRemoveTriggerChange {
  data: AutomationBotRemoveTriggersData
  transaction: TransactionDef<AutomationBotRemoveTriggersData>
}

export type TxPayloadChange = AutoAddTriggerChange | AutoRemoveTriggerChange | undefined

export type TxPayloadChangeAction =
  | {
      type: 'add-trigger'
      transaction:
        | TransactionDef<AutomationBotAddTriggerData>
        | TransactionDef<AutomationBotAddAggregatorTriggerData>
      data: AutomationBotAddTriggerData | AutomationBotAddAggregatorTriggerData
    }
  | {
      type: 'remove-triggers'
      transaction: TransactionDef<AutomationBotRemoveTriggersData>
      data: AutomationBotRemoveTriggersData
    }
  | { type: 'reset' }

export function gasEstimationReducer(
  state: TxPayloadChange,
  action: TxPayloadChangeAction,
): TxPayloadChange {
  switch (action.type) {
    case 'add-trigger':
      return { data: action.data, transaction: action.transaction }
    case 'remove-triggers':
      return { data: action.data, transaction: action.transaction }
    case 'reset':
      return undefined
    default:
      return state
  }
}

export const addTransactionMap = {
  [CONSTANT_MULTIPLE_FORM_CHANGE]: addAutomationBotAggregatorTrigger,
  [BASIC_BUY_FORM_CHANGE]: addAutomationBotTrigger,
  [BASIC_SELL_FORM_CHANGE]: addAutomationBotTrigger,
  [STOP_LOSS_FORM_CHANGE]: addAutomationBotTrigger,
}
