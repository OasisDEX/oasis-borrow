import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import type { OasisActionsTxData } from 'blockchain/calls/oasisActions'
import type { OasisActionCallData } from 'features/ajna/positions/common/hooks/useAjnaTxHandler'
import type {
  AutomationAddTriggerData,
  AutomationAddTriggerTxDef,
  AutomationRemoveTriggerData,
  AutomationRemoveTriggerTxDef,
} from 'features/automation/common/txDefinitions'

export const TX_DATA_CHANGE = 'TX_DATA_CHANGE'

export type TxPayloadChange =
  | {
      data: AutomationAddTriggerData | AutomationRemoveTriggerData | OasisActionCallData
      transaction:
        | AutomationAddTriggerTxDef
        | AutomationRemoveTriggerTxDef
        | TransactionDef<OasisActionsTxData>
    }
  | undefined

export type TxPayloadChangeAction =
  | {
      type: 'tx-data'
      transaction:
        | AutomationAddTriggerTxDef
        | AutomationRemoveTriggerTxDef
        | TransactionDef<OasisActionsTxData>
      data: AutomationAddTriggerData | AutomationRemoveTriggerData | OasisActionCallData
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
