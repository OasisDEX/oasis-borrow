import { OpenVaultChange, OpenVaultState } from './openVault'

export type OpenVaultFormChange = {
  kind: 'toggleGenerateOption'
}

export function applyOpenVaultForm(change: OpenVaultChange, state: OpenVaultState): OpenVaultState {
  if (change.kind === 'toggleGenerateOption' && state.depositAmount) {
    return {
      ...state,
      showGenerateOption: !state.showGenerateOption,
      ...(state.showGenerateOption && { generateAmount: undefined }),
    }
  }

  return state
}
