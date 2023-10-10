import type { BigNumber } from 'bignumber.js'
import type { SelectedDaiAllowanceRadio } from 'components/vault/commonMultiply/ManageVaultDaiAllowance.types'

import type { CloseVaultTo } from './CloseVaultTo.types'
import type { MainAction } from './MainAction.types'
import type { ManageMultiplyVaultEditingStage } from './ManageMultiplyVaultEditingStage.types'
import type { ManageMultiplyVaultStage } from './ManageMultiplyVaultStage.types'
import type { OtherAction } from './OtherAction.types'

export interface MutableManageMultiplyVaultState {
  stage: ManageMultiplyVaultStage
  originalEditingStage: ManageMultiplyVaultEditingStage
  mainAction: MainAction
  otherAction: OtherAction
  showSliderController: boolean

  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  depositDaiAmount?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  paybackAmount?: BigNumber
  generateAmount?: BigNumber
  closeVaultTo: CloseVaultTo

  collateralAllowanceAmount?: BigNumber
  daiAllowanceAmount?: BigNumber
  selectedCollateralAllowanceRadio: 'unlimited' | 'depositAmount' | 'custom'
  selectedDaiAllowanceRadio: SelectedDaiAllowanceRadio

  requiredCollRatio?: BigNumber
  buyAmount?: BigNumber
  buyAmountUSD?: BigNumber

  sellAmount?: BigNumber
  sellAmountUSD?: BigNumber
}
