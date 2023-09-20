import type { BigNumber } from 'bignumber.js'

import type { CloseVaultTo } from './CloseVaultTo.types'
import type { MainAction } from './MainAction.types'
import type { ManageMultiplyVaultEditingStage } from './ManageMultiplyVaultEditingStage.types'
import type { MutableManageMultiplyVaultState } from './MutableManageMultiplyVaultState.types'
import type { OtherAction } from './OtherAction.types'
export interface ManageVaultFunctions {
  progress?: () => void
  regress?: () => void
  toggle?: (stage: ManageMultiplyVaultEditingStage) => void

  updateDepositAmount?: (depositAmount?: BigNumber) => void
  updateDepositAmountUSD?: (depositAmountUSD?: BigNumber) => void
  updateDepositDaiAmount?: (depositDaiAmount?: BigNumber) => void
  updateDepositAmountMax?: () => void
  updateDepositDaiAmountMax?: () => void
  updatePaybackAmount?: (paybackAmount?: BigNumber) => void
  updatePaybackAmountMax?: () => void

  updateWithdrawAmount?: (withdrawAmount?: BigNumber) => void
  updateWithdrawAmountUSD?: (withdrawAmountUSD?: BigNumber) => void
  updateWithdrawAmountMax?: () => void
  updateGenerateAmount?: (generateAmount?: BigNumber) => void
  updateGenerateAmountMax?: () => void

  setCloseVaultTo?: (closeVaultTo: CloseVaultTo) => void

  updateCollateralAllowanceAmount?: (amount?: BigNumber) => void
  setCollateralAllowanceAmountUnlimited?: () => void
  setCollateralAllowanceAmountToDepositAmount?: () => void
  resetCollateralAllowanceAmount?: () => void
  updateDaiAllowanceAmount?: (amount?: BigNumber) => void
  setDaiAllowanceAmountUnlimited?: () => void
  setDaiAllowanceAmountToPaybackAmount?: () => void
  setDaiAllowanceAmountToDepositDaiAmount?: () => void
  resetDaiAllowanceAmount?: () => void
  clear: () => void

  injectStateOverride: (state: Partial<MutableManageMultiplyVaultState>) => void

  toggleSliderController?: () => void
  updateRequiredCollRatio?: (value: BigNumber) => void
  setMainAction?: (mainAction: MainAction) => void
  setOtherAction?: (otherAction: OtherAction) => void
  updateBuy?: (buyAmount?: BigNumber) => void
  updateBuyUSD?: (buyAmountUSD?: BigNumber) => void
  updateBuyMax?: () => void
  updateSell?: (sellAmount?: BigNumber) => void
  updateSellUSD?: (sellAmountUSD?: BigNumber) => void
  updateSellMax?: () => void
}
