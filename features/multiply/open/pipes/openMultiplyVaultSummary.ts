import { OpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault'
import { OpenMultiplyVaultCalculations } from 'features/multiply/open/pipes/openMultiplyVaultCalculations'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { zero } from 'helpers/zero'

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
