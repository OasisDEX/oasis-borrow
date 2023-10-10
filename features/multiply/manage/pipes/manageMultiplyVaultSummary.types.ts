import type { BalanceInfo } from 'features/shared/balanceInfo.types'

import type { ManageVaultCalculations } from './manageMultiplyVaultCalculations.types'
import type { ManageVaultConditions } from './manageMultiplyVaultConditions.types'

export type ManageVaultSummary = Pick<
  ManageVaultCalculations,
  'afterCollateralBalance' | 'afterCollateralizationRatio' | 'afterLiquidationPrice'
> &
  Pick<ManageVaultConditions, 'vaultWillBeAtRiskLevelDanger' | 'vaultWillBeAtRiskLevelWarning'> &
  Pick<BalanceInfo, 'collateralBalance'>
