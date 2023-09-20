import type { BalanceInfo } from 'features/shared/balanceInfo.types'

import type { ManageVaultCalculations } from './manageVaultCalculations.types'
import type { ManageVaultConditions } from './manageVaultConditions.types'

export type ManageVaultSummary = Pick<
  ManageVaultCalculations,
  'afterCollateralBalance' | 'afterCollateralizationRatio' | 'afterLiquidationPrice'
> &
  Pick<ManageVaultConditions, 'vaultWillBeAtRiskLevelDanger' | 'vaultWillBeAtRiskLevelWarning'> &
  Pick<BalanceInfo, 'collateralBalance'>
