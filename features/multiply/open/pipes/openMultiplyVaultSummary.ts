import type { OpenMultiplyVaultState } from './openMultiplyVault.types'

export function applyOpenVaultSummary(state: OpenMultiplyVaultState) {
  const {
    isOpenStage,
    balanceInfo: { collateralBalance },
    afterCollateralBalance,
  } = state

  if (isOpenStage) return state

  return {
    ...state,
    summary: {
      collateralBalance,
      afterCollateralBalance,
    },
  }
}
