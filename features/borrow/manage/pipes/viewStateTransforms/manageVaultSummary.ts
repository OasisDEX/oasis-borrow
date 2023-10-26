import type { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault.types'

export function applyManageVaultSummary<VaultState extends ManageStandardBorrowVaultState>(
  state: VaultState,
): VaultState {
  const {
    isManageStage,
    balanceInfo: { collateralBalance },
    vaultWillBeAtRiskLevelDanger,
    vaultWillBeAtRiskLevelWarning,
    afterCollateralBalance,
    afterCollateralizationRatio,
    afterLiquidationPrice,
  } = state

  if (isManageStage) return state

  return {
    ...state,
    summary: {
      vaultWillBeAtRiskLevelDanger,
      vaultWillBeAtRiskLevelWarning,
      afterCollateralBalance,
      afterCollateralizationRatio,
      afterLiquidationPrice,
      collateralBalance,
    },
  }
}
