import type { ManageVaultEditingStage } from 'features/borrow/manage/pipes/types/ManageBorrowVaultStage.types'

type ManageVaultMultiplyTransitionChange =
  | {
      kind: 'progressMultiplyTransition'
    }
  | {
      kind: 'multiplyTransitionInProgress'
    }
  | {
      kind: 'multiplyTransitionFailure'
    }
  | {
      kind: 'multiplyTransitionSuccess'
    }

export type ManageVaultTransitionChange =
  | ManageVaultMultiplyTransitionChange
  | {
      kind: 'toggleEditing'
      stage: ManageVaultEditingStage
    }
  | {
      kind: 'progressEditing'
    }
  | {
      kind: 'progressProxy'
    }
  | {
      kind: 'progressCollateralAllowance'
    }
  | {
      kind: 'backToEditing'
    }
  | {
      kind: 'resetToEditing'
    }
  | {
      kind: 'regressCollateralAllowance'
    }
  | {
      kind: 'regressDaiAllowance'
    }
  | {
      kind: 'clear'
    }
