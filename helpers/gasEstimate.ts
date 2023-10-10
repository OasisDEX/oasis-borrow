import type { TxPayloadChange, TxPayloadChangeAction } from './gasEstimate.types'

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
