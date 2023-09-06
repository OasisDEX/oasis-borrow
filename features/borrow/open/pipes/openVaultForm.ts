import { OpenVaultChange, OpenVaultState } from 'features/borrow/open/pipes/openVault'

export type OpenVaultFormChange = {
  kind: 'toggleGenerateOption'
}

export function applyOpenVaultForm(state: OpenVaultState, change: OpenVaultChange): OpenVaultState {
  if (change.kind === 'toggleGenerateOption' && state.depositAmount) {
    return {
      ...state,
      showGenerateOption: !state.showGenerateOption,
      ...(state.showGenerateOption && { generateAmount: undefined }),
    }
  }

  return state
}
