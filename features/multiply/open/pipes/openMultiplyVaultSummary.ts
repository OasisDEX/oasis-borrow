import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import { zero } from 'helpers/zero'

import type { OpenMultiplyVaultState } from './openMultiplyVault'
import type { OpenMultiplyVaultCalculations } from './openMultiplyVaultCalculations'

export type OpenVaultSummary = Pick<OpenMultiplyVaultCalculations, 'afterCollateralBalance'> &
  Pick<BalanceInfo, 'collateralBalance'>

export const defaultOpenVaultSummary: OpenVaultSummary = {
  collateralBalance: zero,
  afterCollateralBalance: zero,
}

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
