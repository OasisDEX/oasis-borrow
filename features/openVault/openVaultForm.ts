import { OpenVaultChange, OpenVaultState } from './openVault'

export type OpenVaultFormChange =
  | {
      kind: 'toggleGenerateOption'
    }
  | { kind: 'toggleIlkDetails' }

export function applyOpenVaultForm(change: OpenVaultChange, state: OpenVaultState): OpenVaultState {
  if (change.kind === 'toggleGenerateOption') {
    return {
      ...state,
      showGenerateOption: !state.showGenerateOption,
    }
  }

  if (change.kind === 'toggleIlkDetails') {
    return {
      ...state,
      showIlkDetails: !state.showIlkDetails,
    }
  }

  return state
}
