import type { BigNumber } from 'bignumber.js'
import type { IlkData } from 'blockchain/ilks.types'
import type { Vault } from 'blockchain/vaults.types'
import type { SelectedDaiAllowanceRadio } from 'components/vault/commonMultiply/ManageVaultDaiAllowance.types'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import type { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData.types'
import type { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData.types'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import type { TxError } from 'helpers/types'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'

import type { MainAction } from './types/MainAction.types'
import type {
  ManageBorrowVaultStage,
  ManageVaultEditingStage,
} from './types/ManageBorrowVaultStage.types'
import type { ManageVaultAllowanceChange } from './viewStateTransforms/manageVaultAllowances.types'
import type { ManageVaultCalculations } from './viewStateTransforms/manageVaultCalculations.types'
import type { ManageVaultConditions } from './viewStateTransforms/manageVaultConditions.types'
import type { ManageVaultEnvironmentChange } from './viewStateTransforms/manageVaultEnvironment.types'
import type { ManageVaultFormChange } from './viewStateTransforms/manageVaultForm.types'
import type { ManageVaultInputChange } from './viewStateTransforms/manageVaultInput.types'
import type { ManageVaultSummary } from './viewStateTransforms/manageVaultSummary.types'
import type { ManageVaultTransactionChange } from './viewStateTransforms/manageVaultTransactions.types'
import type { ManageVaultTransitionChange } from './viewStateTransforms/manageVaultTransitions.types'

interface ManageVaultInjectedOverrideChange {
  kind: 'injectStateOverride'
  stateToOverride: Partial<ManageStandardBorrowVaultState>
}

export type ManageVaultChange =
  | ManageVaultInputChange
  | ManageVaultFormChange
  | ManageVaultAllowanceChange
  | ManageVaultTransitionChange
  | ManageVaultTransactionChange
  | ManageVaultEnvironmentChange
  | ManageVaultInjectedOverrideChange

export interface MutableManageVaultState {
  stage: ManageBorrowVaultStage
  mainAction: MainAction
  originalEditingStage: ManageVaultEditingStage
  showDepositAndGenerateOption: boolean
  showPaybackAndWithdrawOption: boolean
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  generateAmount?: BigNumber
  paybackAmount?: BigNumber
  collateralAllowanceAmount?: BigNumber
  daiAllowanceAmount?: BigNumber
  selectedCollateralAllowanceRadio: 'unlimited' | 'depositAmount' | 'custom'
  selectedDaiAllowanceRadio: SelectedDaiAllowanceRadio
}

export interface ManageVaultEnvironment<V extends Vault> {
  account?: string
  accountIsController: boolean
  proxyAddress?: string
  collateralAllowance?: BigNumber
  daiAllowance?: BigNumber
  vault: V
  ilkData: IlkData
  balanceInfo: BalanceInfo
  priceInfo: PriceInfo
  vaultHistory: VaultHistoryEvent[]
}
interface ManageVaultFunctions {
  progress?: () => void
  regress?: () => void
  toggle?: (stage: ManageVaultEditingStage) => void
  setMainAction?: (action: MainAction) => void
  toggleDepositAndGenerateOption?: () => void
  togglePaybackAndWithdrawOption?: () => void
  updateDeposit?: (depositAmount?: BigNumber) => void
  updateDepositUSD?: (depositAmountUSD?: BigNumber) => void
  updateDepositMax?: () => void
  updateGenerate?: (generateAmount?: BigNumber) => void
  updateGenerateMax?: () => void
  updateWithdraw?: (withdrawAmount?: BigNumber) => void
  updateWithdrawUSD?: (withdrawAmountUSD?: BigNumber) => void
  updateWithdrawMax?: () => void
  updatePayback?: (paybackAmount?: BigNumber) => void
  updatePaybackMax?: () => void
  updateCollateralAllowanceAmount?: (amount?: BigNumber) => void
  setCollateralAllowanceAmountUnlimited?: () => void
  setCollateralAllowanceAmountToDepositAmount?: () => void
  resetCollateralAllowanceAmount?: () => void
  updateDaiAllowanceAmount?: (amount?: BigNumber) => void
  setDaiAllowanceAmountUnlimited?: () => void
  setDaiAllowanceAmountToPaybackAmount?: () => void
  resetDaiAllowanceAmount?: () => void
  clear: () => void
  injectStateOverride: (state: Partial<MutableManageVaultState>) => void
  toggleMultiplyTransition?: () => void
}
interface ManageVaultTxInfo {
  collateralAllowanceTxHash?: string
  daiAllowanceTxHash?: string
  proxyTxHash?: string
  manageTxHash?: string
  txError?: TxError
  etherscan?: string
  proxyConfirmations?: number
  safeConfirmations: number
}

export type GenericManageBorrowVaultState<V extends Vault> = MutableManageVaultState &
  ManageVaultCalculations &
  ManageVaultConditions &
  ManageVaultEnvironment<V> &
  ManageVaultFunctions &
  ManageVaultTxInfo & {
    errorMessages: VaultErrorMessage[]
    warningMessages: VaultWarningMessage[]
    summary: ManageVaultSummary
    initialTotalSteps: number
    totalSteps: number
    currentStep: number
    stopLossData?: StopLossTriggerData
    autoBuyData?: AutoBSTriggerData
    autoSellData?: AutoBSTriggerData
    constantMultipleData?: ConstantMultipleTriggerData
    autoTakeProfitData?: AutoTakeProfitTriggerData
  } & HasGasEstimation

export type ManageStandardBorrowVaultState = GenericManageBorrowVaultState<Vault>
