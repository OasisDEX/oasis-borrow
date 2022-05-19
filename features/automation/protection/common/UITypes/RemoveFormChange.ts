import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'

import { TxError } from '../../../../../helpers/types'

export const REMOVE_FORM_CHANGE = 'REMOVE_FORM_CHANGE'

/* End of section */
export type RemoveFormChangeAction = {
  type: 'tx-details'
  txDetails: {
    txStatus?: TxStatus
    txError?: TxError
    txHash?: string
    totalCost?: BigNumber
  }
}

export function removeFormReducer(
  state: RemoveFormChange,
  action: RemoveFormChangeAction,
): RemoveFormChange {
  switch (action.type) {
    case 'tx-details':
      return { ...state, txDetails: action.txDetails }
    default:
      return state
  }
}

export type RemoveFormChange = {
  txDetails?: {
    txStatus?: TxStatus
    txError?: TxError
    txHash?: string
    totalCost?: BigNumber
  }
}
