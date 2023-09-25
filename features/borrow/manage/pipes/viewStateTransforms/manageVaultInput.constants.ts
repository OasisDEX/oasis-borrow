import type { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault.types'

export const depositAndGenerateDefaults: Partial<ManageStandardBorrowVaultState> = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  generateAmount: undefined,
}

export const paybackAndWithdrawDefaults: Partial<ManageStandardBorrowVaultState> = {
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
  paybackAmount: undefined,
}
