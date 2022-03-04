import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'

export const REMOVE_FORM_CHANGE = 'REMOVE_FORM_CHANGE'

/* End of section */
export type Action = {
  type: 'tx-details'
  txDetails: {
    txStatus?: TxStatus
    txHash?: string
    totalCost?: BigNumber
  }
}

export function removeFormReducer(state: RemoveFormChange, action: Action): RemoveFormChange {
  switch (action.type) {
    case 'tx-details':
      return { ...state, txDetails: action.txDetails }
    default:
      return state
  }
}

export interface RemoveFormChange {
  txDetails?: {
    txStatus?: TxStatus
    txHash?: string
    totalCost?: BigNumber
  }
}
