import type { BalanceInfo } from 'features/shared/balanceInfo.types'

import type { OpenMultiplyVaultCalculations } from './openMultiplyVaultCalculations.types'

export type OpenVaultSummary = Pick<OpenMultiplyVaultCalculations, 'afterCollateralBalance'> &
  Pick<BalanceInfo, 'collateralBalance'>
