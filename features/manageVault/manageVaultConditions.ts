import { isNullish } from 'helpers/functions'
import { ManageVaultState } from './manageVault'

export function applyManageVaultConditions(state: ManageVaultState): ManageVaultState {
  const { depositAmount, generateAmount, withdrawAmount, paybackAmount } = state

  const depositAndWithdrawAmountsEmpty = isNullish(depositAmount) && isNullish(withdrawAmount)
  const generateAndPaybackAmountsEmpty = isNullish(generateAmount) && isNullish(paybackAmount)

  const editingButtonDisabled = depositAndWithdrawAmountsEmpty && generateAndPaybackAmountsEmpty
  return {
    ...state,
    editingButtonDisabled,
  }
}
