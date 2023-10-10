import { allowanceDefaults } from './manageMultiplyVaultAllowances.constants'
import type { ManageMultiplyVaultState } from './ManageMultiplyVaultState.types'

export const manageMultiplyInputsDefaults: Partial<ManageMultiplyVaultState> = {
  buyAmount: undefined,
  buyAmountUSD: undefined,
  sellAmount: undefined,
  sellAmountUSD: undefined,
  depositAmount: undefined,
  depositAmountUSD: undefined,
  depositDaiAmount: undefined,
  paybackAmount: undefined,
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
  generateAmount: undefined,

  requiredCollRatio: undefined,
}

export const manageVaultFormDefaults: Partial<ManageMultiplyVaultState> = {
  ...allowanceDefaults,
  ...manageMultiplyInputsDefaults,
}
