import { maxUint256 } from 'blockchain/calls/erc20'

import type {
  ManageBorrowVaultStage,
  ManageVaultEditingStage,
  MutableManageVaultState,
} from './manageVault.types'

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
