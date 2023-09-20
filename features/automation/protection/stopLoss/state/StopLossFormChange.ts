import type { StopLossFormChange, StopLossFormChangeAction } from './StopLossFormChange.types'

export function formChangeReducer(
  state: StopLossFormChange,
  action: StopLossFormChangeAction,
): StopLossFormChange {
  switch (action.type) {
    case 'stop-loss-level':
      return { ...state, stopLossLevel: action.stopLossLevel }
    case 'close-type':
      return { ...state, collateralActive: action.toCollateral }
    case 'current-form':
      return { ...state, currentForm: action.currentForm }
    case 'is-awaiting-confirmation':
      return { ...state, isAwaitingConfirmation: action.isAwaitingConfirmation }
    case 'reset':
      return { ...state, ...action.resetData }
    case 'tx-details':
      return { ...state, txDetails: action.txDetails }
    default:
      return state
  }
}
