import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { OpenVaultCalculations } from 'features/borrow/open/pipes/openVaultCalculations'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { zero } from 'helpers/zero'

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
