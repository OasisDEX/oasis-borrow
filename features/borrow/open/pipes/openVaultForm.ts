import type { OpenVaultChange, OpenVaultState } from './openVault.types'

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
