import type { BaseManageVaultStage } from 'features/types/vaults/BaseManageVaultStage'

import type { ManageMultiplyVaultEditingStage } from './ManageMultiplyVaultEditingStage.types'

export type ManageMultiplyVaultStage =
  | ManageMultiplyVaultEditingStage
  | BaseManageVaultStage
  | 'borrowTransitionWaitingForConfirmation'
  | 'borrowTransitionInProgress'
  | 'borrowTransitionFailure'
  | 'borrowTransitionSuccess'
