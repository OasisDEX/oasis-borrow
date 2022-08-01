import {
  addAutomationBotTrigger,
  AutomationBotAddTriggerData,
  AutomationBotRemoveTriggerData,
  removeAutomationBotTrigger,
} from 'blockchain/calls/automationBot'
import { TransactionDef } from 'blockchain/calls/callsHelpers'

export const TX_DATA_CHANGE = 'TX_DATA_CHANGE'

interface AutoAddTriggerChange {
  data: AutomationBotAddTriggerData
  transaction: TransactionDef<AutomationBotAddTriggerData>
}

interface AutoRemoveTriggerChange {
  data: AutomationBotRemoveTriggerData
  transaction: TransactionDef<AutomationBotRemoveTriggerData>
}

export type TxPayloadChange = AutoAddTriggerChange | AutoRemoveTriggerChange | undefined

export type TxPayloadChangeAction =
  | {
      type: 'add-trigger'
      data: AutomationBotAddTriggerData
    }
  | {
      type: 'remove-trigger'
      data: AutomationBotRemoveTriggerData
    }
  | { type: 'reset' }

export function gasEstimationReducer(
  state: TxPayloadChange,
  action: TxPayloadChangeAction,
): TxPayloadChange {
  switch (action.type) {
    case 'add-trigger':
      return { data: action.data, transaction: addAutomationBotTrigger }
    case 'remove-trigger':
      return { data: action.data, transaction: removeAutomationBotTrigger }
    case 'reset':
      return undefined
    default:
      return state
  }
}
