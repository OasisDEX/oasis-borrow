import { ManageBorrowVaultStage } from 'features/borrow/manage/pipes/manageVault'

export const BORROW_VAULT_PILL_CHANGE_SUBJECT = 'BorrowPillChange'

export type BorrowPillChangeAction = {
  type: 'change-borrow-pill'
  currentStage: ManageBorrowVaultStage
}

export interface BorrowPillChange {
  currentStage: ManageBorrowVaultStage
}

export function borrowPillChangeReducer(
  state: BorrowPillChange,
  action: BorrowPillChangeAction,
): BorrowPillChange {
  switch (action.type) {
    case 'change-borrow-pill':
      return { ...state, currentStage: action.currentStage }
    default:
      return state
  }
}
