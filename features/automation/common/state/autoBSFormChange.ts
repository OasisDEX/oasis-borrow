import type { AutoBSChangeAction, AutoBSFormChange } from './autoBSFormChange.types'

export function autoBSFormChangeReducer(
  state: AutoBSFormChange,
  action: AutoBSChangeAction,
): AutoBSFormChange {
  switch (action.type) {
    case 'trigger-id':
      return { ...state, triggerId: action.triggerId }
    case 'execution-coll-ratio':
      return { ...state, execCollRatio: action.execCollRatio }
    case 'target-coll-ratio':
      return { ...state, targetCollRatio: action.targetCollRatio }
    case 'max-buy-or-sell-price':
      return { ...state, maxBuyOrMinSellPrice: action.maxBuyOrMinSellPrice }
    case 'continuous':
      return { ...state, continuous: action.continuous }
    case 'deviation':
      return { ...state, deviation: action.deviation }
    case 'max-gas-fee-in-gwei':
      return { ...state, maxBaseFeeInGwei: action.maxBaseFeeInGwei }
    case 'current-form':
      return { ...state, currentForm: action.currentForm }
    case 'with-threshold':
      return { ...state, withThreshold: action.withThreshold }
    case 'tx-details':
      return { ...state, txDetails: action.txDetails }
    case 'is-editing':
      return { ...state, isEditing: action.isEditing }
    case 'is-awaiting-confirmation':
      return { ...state, isAwaitingConfirmation: action.isAwaitingConfirmation }
    case 'reset':
      return { ...state, ...action.resetData }
    case 'form-defaults':
      return {
        ...state,
        targetCollRatio: action.targetCollRatio,
        execCollRatio: action.execCollRatio,
      }
    default:
      return state
  }
}
