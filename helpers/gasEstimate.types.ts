import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import type { OasisActionsTxData } from 'blockchain/calls/oasisActions'
import type { OasisActionCallData } from 'features/ajna/positions/common/hooks/useAjnaTxHandler.types'
import type {
  AutomationAddTriggerData,
  AutomationAddTriggerTxDef,
  AutomationRemoveTriggerData,
  AutomationRemoveTriggerTxDef,
} from 'features/automation/common/txDefinitions.types'

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
