import {
  ManageStandardBorrowVaultState,
  ManageVaultChange,
} from 'features/borrow/manage/pipes/manageVault'

export function applyManageVaultInjectedOverride<VaultState extends ManageStandardBorrowVaultState>(
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
