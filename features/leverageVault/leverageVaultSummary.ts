import { BalanceInfo } from 'features/shared/balanceInfo'
import { zero } from 'helpers/zero'

import { LeverageVaultState } from './leverageVault'
import { LeverageVaultCalculations } from './leverageVaultCalculations'

export type OpenVaultSummary = Pick<LeverageVaultCalculations, 'afterCollateralBalance'> &
  Pick<BalanceInfo, 'collateralBalance'>

export const defaultOpenVaultSummary: OpenVaultSummary = {
  collateralBalance: zero,
  afterCollateralBalance: zero,
}

export function applyOpenVaultSummary(state: LeverageVaultState) {
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
