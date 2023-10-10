import type { BalanceInfo } from 'features/shared/balanceInfo.types'

import type { OpenVaultCalculations } from './openVaultCalculations.types'

export type OpenVaultSummary = Pick<OpenVaultCalculations, 'afterCollateralBalance'> &
  Pick<BalanceInfo, 'collateralBalance'>
