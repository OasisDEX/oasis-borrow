import type {
  AutoTakeProfitFormChange,
  AutoTakeProfitFormChangeAction,
} from './autoTakeProfitFormChange.types'

export function autoTakeProfitFormChangeReducer(
  state: AutoTakeProfitFormChange,
  action: AutoTakeProfitFormChangeAction,
): AutoTakeProfitFormChange {
  switch (action.type) {
    case 'trigger-id':
      return { ...state, triggerId: action.triggerId }
    case 'execution-price':
      return {
        ...state,
        executionPrice: action.executionPrice,
        executionCollRatio: action.executionCollRatio,
      }
    case 'current-form':
      return { ...state, currentForm: action.currentForm }
    case 'close-type':
      return { ...state, toCollateral: action.toCollateral }
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
        defaultExecutionPrice: action.executionPrice,
        defaultExecutionCollRatio: action.executionCollRatio,
        executionPrice: action.executionPrice,
        executionCollRatio: action.executionCollRatio,
        toCollateral: action.toCollateral,
      }
    default:
      return state
  }
}
