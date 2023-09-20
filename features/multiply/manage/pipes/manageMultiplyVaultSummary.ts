import type { BalanceInfo } from 'features/shared/balanceInfo'
import { zero } from 'helpers/zero'

import type { ManageVaultCalculations } from './manageMultiplyVaultCalculations'
import type { ManageVaultConditions } from './manageMultiplyVaultConditions'
import type { ManageMultiplyVaultState } from './types'

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

export function applyManageVaultSummary<VS extends ManageMultiplyVaultState>(state: VS): VS {
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
