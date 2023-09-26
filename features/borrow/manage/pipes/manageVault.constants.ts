import { maxUint256 } from 'blockchain/calls/erc20.constants'

import type { MutableManageVaultState } from './manageVault.types'
import type {
  ManageBorrowVaultStage,
  ManageVaultEditingStage,
} from './types/ManageBorrowVaultStage.types'

export const defaultMutableManageVaultState: MutableManageVaultState = {
  stage: 'collateralEditing' as ManageBorrowVaultStage,
  mainAction: 'depositGenerate',
  originalEditingStage: 'collateralEditing' as ManageVaultEditingStage,
  showDepositAndGenerateOption: false,
  showPaybackAndWithdrawOption: false,
  collateralAllowanceAmount: maxUint256,
  daiAllowanceAmount: maxUint256,
  selectedCollateralAllowanceRadio: 'unlimited' as 'unlimited',
  selectedDaiAllowanceRadio: 'unlimited' as 'unlimited',
}
