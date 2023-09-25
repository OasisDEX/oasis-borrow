import type BigNumber from 'bignumber.js'
import type { AllVaultStages } from 'features/types/vaults/AllVaultStages'

type SelectedCollateralAllowanceRadio = 'unlimited' | 'depositAmount' | 'custom'
export type ManageVaultCollateralAllowanceProps = {
  stage: AllVaultStages
  vault: { token: string }
  depositAmount?: BigNumber
  collateralAllowanceAmount?: BigNumber
  updateCollateralAllowanceAmount?: (amount?: BigNumber) => void
  setCollateralAllowanceAmountUnlimited?: () => void
  setCollateralAllowanceAmountToDepositAmount?: () => void
  resetCollateralAllowanceAmount?: () => void
  selectedCollateralAllowanceRadio: SelectedCollateralAllowanceRadio
}
