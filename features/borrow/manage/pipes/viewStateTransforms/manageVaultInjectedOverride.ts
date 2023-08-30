import { ManageBorrowVaultState, ManageVaultChange } from 'features/borrow/manage/pipes/manageVault'

export function applyManageVaultInjectedOverride<VaultState extends ManageBorrowVaultState>(
  change: ManageVaultChange,
  state: VaultState,
): VaultState {
  if (change.kind === 'injectStateOverride') {
    return {
      ...state,
      ...change.stateToOverride,
    }
  }
  return state
}
