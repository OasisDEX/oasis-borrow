import { OtherAction } from 'features/multiply/manage/pipes/manageMultiplyVault'

export const MULTIPLY_VAULT_PILL_CHANGE_SUBJECT = 'MultiplyPillChange'

export type MultiplyPillChangeAction = {
  type: 'change-multiply-pill'
  currentStage: OtherAction
}

export interface MultiplyPillChange {
  currentStage: OtherAction
}

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
