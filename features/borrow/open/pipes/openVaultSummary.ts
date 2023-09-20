import type { BalanceInfo } from 'features/shared/balanceInfo'
import { zero } from 'helpers/zero'

import type { OpenVaultState } from './openVault'
import type { OpenVaultCalculations } from './openVaultCalculations'

export type OpenVaultSummary = Pick<OpenVaultCalculations, 'afterCollateralBalance'> &
  Pick<BalanceInfo, 'collateralBalance'>

export const defaultOpenVaultSummary: OpenVaultSummary = {
  collateralBalance: zero,
  afterCollateralBalance: zero,
}

export function applyOpenVaultSummary(state: OpenVaultState) {
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
