import type { BaseManageVaultStage } from 'features/types/vaults/BaseManageVaultStage'

export type ManageVaultEditingStage =
  | 'collateralEditing'
  | 'daiEditing'
  | 'multiplyTransitionEditing'

export type ManageBorrowVaultStage =
  | BaseManageVaultStage
  | ManageVaultEditingStage
  | 'multiplyTransitionWaitingForConfirmation'
  | 'multiplyTransitionInProgress'
  | 'multiplyTransitionFailure'
  | 'multiplyTransitionSuccess'
