import { GUNI_MAX_SLIPPAGE } from '../../../../../helpers/multiply/calculations'
import { ManageMultiplyVaultState } from '../../../../multiply/manage/pipes/manageMultiplyVault'

// this method extends / overwrites applyManageVaultConditions
export function applyGuniManageVaultConditions(
  state: ManageMultiplyVaultState,
): ManageMultiplyVaultState {
  const { slippage } = state

  const invalidSlippage = slippage.gt(GUNI_MAX_SLIPPAGE)

  return {
    ...state,
    invalidSlippage,
  }
}
