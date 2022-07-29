//TODO: Move to different file
import { TxMeta } from '@oasisdex/transactions'
import {
  addAutomationBotTrigger,
  AutomationBotAddTriggerData,
  AutomationBotRemoveTriggerData,
} from 'blockchain/calls/automationBot'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import {
  AddFormChange,
} from 'features/automation/protection/common/UITypes/AddFormChange'

export const TX_DATA_CHANGE = 'TX_DATA_CHANGE'

export interface TxPayloadChange<T extends TxMeta> {
  data: T
  transaction: TransactionDef<T>
}

export interface TxPayloadChangeBase {
  data: any
  transaction: any
}

export type TxPayloadChangeAction =
  | {
      type: 'add-trigger'
      tx: TxPayloadChange<AutomationBotAddTriggerData>
    }
  | {
      type: 'remove-trigger'
      tx: TxPayloadChange<AutomationBotRemoveTriggerData>
    }

export function gasEstimationReducer(
  state: TxPayloadChange,
  action: TxPayloadChangeAction,
): AddFormChange {
  switch (action.type) {
    case 'add-trigger':
      return { tx: action.tx, transaction: addAutomationBotTrigger }
    default:
      return state
  }
}
