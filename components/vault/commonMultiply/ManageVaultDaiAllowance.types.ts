import type BigNumber from 'bignumber.js'
import type { AllVaultStages } from 'features/types/vaults/AllVaultStages'

export type ManageVaultDaiAllowanceProps = {
  stage: AllVaultStages
  daiAllowanceAmount?: BigNumber
  updateDaiAllowanceAmount?: (amount?: BigNumber) => void
  setDaiAllowanceAmountUnlimited?: () => void
  setDaiAllowanceAmountToPaybackAmount?: () => void
  setDaiAllowanceAmountToDepositDaiAmount?: () => void
  resetDaiAllowanceAmount?: () => void
  selectedDaiAllowanceRadio: SelectedDaiAllowanceRadio
  paybackAmount?: BigNumber
  depositDaiAmount?: BigNumber
}

export type SelectedDaiAllowanceRadio = 'unlimited' | 'actionAmount' | 'custom'
