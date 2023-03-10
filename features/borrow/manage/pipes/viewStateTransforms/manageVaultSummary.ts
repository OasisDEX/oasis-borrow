import { BalanceInfo } from 'features/shared/balanceInfo'
import { zero } from 'helpers/zero'

import { ManageStandardBorrowVaultState } from '../manageVault'
import { ManageVaultCalculations } from './manageVaultCalculations'
import { ManageVaultConditions } from './manageVaultConditions'

export type ManageVaultSummary = Pick<
  ManageVaultCalculations,
  'afterCollateralBalance' | 'afterCollateralizationRatio' | 'afterLiquidationPrice'
> &
  Pick<ManageVaultConditions, 'vaultWillBeAtRiskLevelDanger' | 'vaultWillBeAtRiskLevelWarning'> &
  Pick<BalanceInfo, 'collateralBalance'>

export const defaultManageVaultSummary: ManageVaultSummary = {
  vaultWillBeAtRiskLevelDanger: false,
  vaultWillBeAtRiskLevelWarning: false,
  afterCollateralizationRatio: zero,
  afterLiquidationPrice: zero,
  collateralBalance: zero,
  afterCollateralBalance: zero,
}

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
