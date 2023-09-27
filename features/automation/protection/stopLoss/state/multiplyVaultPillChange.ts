import type { MultiplyPillChange, MultiplyPillChangeAction } from './multiplyVaultPillChange.types'

export function multiplyPillChangeReducer(
  state: MultiplyPillChange,
  action: MultiplyPillChangeAction,
): MultiplyPillChange {
  switch (action.type) {
    case 'change-multiply-pill':
      return { ...state, currentStage: action.currentStage }
    default:
      return state
  }
}
