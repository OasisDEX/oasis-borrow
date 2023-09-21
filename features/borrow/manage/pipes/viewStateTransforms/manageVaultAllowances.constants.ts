import { maxUint256 } from 'blockchain/calls/erc20.constants'
import type { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault.types'

export const allowanceDefaults: Partial<ManageStandardBorrowVaultState> = {
  collateralAllowanceAmount: maxUint256,
  daiAllowanceAmount: maxUint256,
}
