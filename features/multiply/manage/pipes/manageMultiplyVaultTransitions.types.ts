import type { ManageMultiplyVaultEditingStage } from './ManageMultiplyVaultEditingStage.types'

type ManageVaultBorrowTransitionChange =
  | {
      kind: 'progressBorrowTransition'
    }
  | {
      kind: 'borrowTransitionInProgress'
    }
  | {
      kind: 'borrowTransitionFailure'
    }
  | {
      kind: 'borrowTransitionSuccess'
    }

export type ManageVaultTransitionChange =
  | ManageVaultBorrowTransitionChange
  | {
      kind: 'toggleEditing'
      stage: ManageMultiplyVaultEditingStage
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
