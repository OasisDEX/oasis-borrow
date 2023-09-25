import type { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault.types'

import { allowanceDefaults } from './manageVaultAllowances.constants'
import {
  depositAndGenerateDefaults,
  paybackAndWithdrawDefaults,
} from './manageVaultInput.constants'

export const manageVaultFormDefaults: Partial<ManageStandardBorrowVaultState> = {
  ...allowanceDefaults,
  ...depositAndGenerateDefaults,
  ...paybackAndWithdrawDefaults,
  showDepositAndGenerateOption: false,
  showPaybackAndWithdrawOption: false,
}
