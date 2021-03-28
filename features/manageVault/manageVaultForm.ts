import { ManageVaultChange, ManageVaultState } from './manageVault'
import { depositAndGenerateDefaults, paybackAndWithdrawDefaults } from './manageVaultActions'
import { allowanceDefaults } from './manageVaultAllowances'

export const manageVaultFormDefaults: Partial<ManageVaultState> = {
  ...allowanceDefaults,
  ...depositAndGenerateDefaults,
  ...paybackAndWithdrawDefaults,
  showDepositAndGenerateOption: false,
  showPaybackAndWithdrawOption: false,
}

export enum ManageVaultFormKind {
  toggleDepositAndGenerateOption = 'toggleDepositAndGenerateOption',
  togglePaybackAndWithdrawOption = 'togglePaybackAndWithdrawOption',
  toggleIlkDetails = 'toggleIlkDetails',
  resetDefaults = 'resetDefaults',
}

export type ManageVaultFormChange =
  | {
      kind: ManageVaultFormKind.toggleDepositAndGenerateOption
    }
  | {
      kind: ManageVaultFormKind.togglePaybackAndWithdrawOption
    }
  | {
      kind: ManageVaultFormKind.toggleIlkDetails
    }
  | {
      kind: ManageVaultFormKind.resetDefaults
    }

export function applyManageVaultForm(
  { kind }: ManageVaultChange,
  state: ManageVaultState,
): ManageVaultState {
  if (kind === ManageVaultFormKind.toggleDepositAndGenerateOption) {
    return {
      ...state,
      showDepositAndGenerateOption: !state.showDepositAndGenerateOption,
    }
  }

  if (kind === ManageVaultFormKind.togglePaybackAndWithdrawOption) {
    return {
      ...state,
      showPaybackAndWithdrawOption: !state.showPaybackAndWithdrawOption,
    }
  }

  if (kind === ManageVaultFormKind.toggleIlkDetails) {
    return {
      ...state,
      showIlkDetails: !state.showIlkDetails,
    }
  }

  return state
}
