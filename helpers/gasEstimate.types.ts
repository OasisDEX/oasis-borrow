import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import type { OasisActionsTxData } from 'blockchain/calls/oasisActions'
import type {
  AutomationAddTriggerData,
  AutomationAddTriggerTxDef,
  AutomationRemoveTriggerData,
  AutomationRemoveTriggerTxDef,
} from 'features/automation/common/txDefinitions.types'
import type { OmniActionCallData } from 'features/omni-kit/hooks'

export type TxPayloadChange =
  | {
      data: AutomationAddTriggerData | AutomationRemoveTriggerData | OmniActionCallData
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
      data: AutomationAddTriggerData | AutomationRemoveTriggerData | OmniActionCallData
    }
  | { type: 'reset' }
