import { TxMeta, TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import {
  AutomationBotAddTriggerData,
  AutomationBotRemoveTriggerData,
} from 'blockchain/calls/automationBot'
import { TransactionDef } from 'blockchain/calls/callsHelpers'

import { TxError } from '../../../../../helpers/types'

export const ADD_FORM_CHANGE = 'ADD_FORM_CHANGE'
export const TX_DATA_CHANGE = 'TX_DATA_CHANGE'

/* End of section */
export type AddFormChangeAction =
  | { type: 'stop-loss'; stopLoss: BigNumber }
  | { type: 'close-type'; toCollateral: boolean }
  | {
      type: 'tx-details'
      txDetails: {
        txStatus?: TxStatus
        txError?: TxError
        txHash?: string
        txCost?: BigNumber
      }
    }

export function formChangeReducer(
  state: AddFormChange,
  action: AddFormChangeAction,
): AddFormChange {
  switch (action.type) {
    case 'stop-loss':
      return { ...state, selectedSLValue: action.stopLoss }
    case 'close-type':
      return { ...state, collateralActive: action.toCollateral }
    case 'tx-details':
      return { ...state, txDetails: action.txDetails }
    default:
      return state
  }
}

export interface AddFormChange {
  selectedSLValue: BigNumber
  collateralActive: boolean
  txDetails?: {
    txStatus?: TxStatus
    txError?: TxError
    txHash?: string
    txCost?: BigNumber
  }
}

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
