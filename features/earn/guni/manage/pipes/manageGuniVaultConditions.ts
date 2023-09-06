import { ManageEarnVaultState } from 'features/earn/guni/manage/pipes/manageGuniVault'
import { GUNI_MAX_SLIPPAGE } from 'helpers/multiply/calculations'

// this method extends / overwrites applyManageVaultConditions
export function applyGuniManageVaultConditions(state: ManageEarnVaultState): ManageEarnVaultState {
  const { slippage } = state

  const invalidSlippage = slippage.gt(GUNI_MAX_SLIPPAGE)

  const hasToDepositCollateralOnEmptyVault = false

  return {
    ...state,
    invalidSlippage,
    hasToDepositCollateralOnEmptyVault,
  }
}
