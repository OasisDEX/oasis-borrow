import { maxUint256 } from 'blockchain/calls/erc20'

import type { ManageMultiplyVaultState } from './ManageMultiplyVaultState.types'

export const allowanceDefaults: Partial<ManageMultiplyVaultState> = {
  collateralAllowanceAmount: maxUint256,
  daiAllowanceAmount: maxUint256,
}
