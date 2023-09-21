import type { BigNumber } from 'bignumber.js'
import type { IlkData } from 'blockchain/ilks.types'
import type { AllowanceChanges, AllowanceOption } from 'features/allowance/allowance.types'
import type {
  OpenVaultStopLossChanges,
  StopLossOpenFlowStages,
} from 'features/automation/protection/stopLoss/openFlow/openVaultStopLoss.types'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import type { CloseVaultTo } from 'features/multiply/manage/pipes/CloseVaultTo.types'
import type { ProxyChanges } from 'features/proxy/proxy.types'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import type { OpenVaultTransactionChange } from 'features/shared/transactions'
import type { OpenVaultTransitionChange } from 'features/vaultTransitions/openVaultTransitions'
import type { TxError } from 'helpers/types'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'

import type { OpenVaultCalculations } from './openVaultCalculations.types'
import type { OpenVaultConditions } from './openVaultConditions.types'
import type { OpenVaultEnvironmentChange } from './openVaultEnvironment.types'
import type { OpenVaultFormChange } from './openVaultForm.types'
import type { OpenVaultInputChange } from './openVaultInput.types'
import type { OpenVaultSummary } from './openVaultSummary.types'

interface OpenVaultInjectedOverrideChange {
  kind: 'injectStateOverride'
  stateToOverride: Partial<OpenVaultState>
}

export type OpenVaultChange =
  | OpenVaultInputChange
  | OpenVaultFormChange
  | OpenVaultTransitionChange
  | OpenVaultTransactionChange
  | AllowanceChanges
  | ProxyChanges
  | OpenVaultEnvironmentChange
  | OpenVaultInjectedOverrideChange
  | OpenVaultStopLossChanges

export type OpenVaultStage =
  | 'editing'
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFailure'
  | 'proxySuccess'
  | 'allowanceWaitingForConfirmation'
  | 'allowanceWaitingForApproval'
  | 'allowanceInProgress'
  | 'allowanceFailure'
  | 'allowanceSuccess'
  | 'txWaitingForConfirmation'
  | 'txWaitingForApproval'
  | 'txInProgress'
  | 'txFailure'
  | 'txSuccess'
  | StopLossOpenFlowStages

export interface MutableOpenVaultState {
  stage: OpenVaultStage
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  generateAmount?: BigNumber
  showGenerateOption: boolean
  selectedAllowanceRadio: AllowanceOption
  allowanceAmount?: BigNumber
  stopLossSkipped: boolean
  stopLossLevel: BigNumber
  visitedStopLossStep: boolean
  id?: BigNumber
}
interface OpenVaultFunctions {
  progress?: () => void
  regress?: () => void
  skipStopLoss?: () => void
  toggleGenerateOption?: () => void
  updateDeposit?: (depositAmount?: BigNumber) => void
  updateDepositUSD?: (depositAmountUSD?: BigNumber) => void
  updateDepositMax?: () => void
  updateGenerate?: (generateAmount?: BigNumber) => void
  updateGenerateMax?: () => void
  updateAllowanceAmount?: (amount?: BigNumber) => void
  setAllowanceAmountUnlimited?: () => void
  setAllowanceAmountToDepositAmount?: () => void
  setAllowanceAmountCustom?: () => void
  clear: () => void
  injectStateOverride: (state: Partial<MutableOpenVaultState>) => void
}
interface OpenVaultEnvironment {
  ilk: string
  account: string
  token: string
  priceInfo: PriceInfo
  balanceInfo: BalanceInfo
  ilkData: IlkData
  proxyAddress?: string
  allowance?: BigNumber
}
interface OpenVaultTxInfo {
  allowanceTxHash?: string
  proxyTxHash?: string
  openTxHash?: string
  stopLossTxHash?: string
  txError?: TxError
  etherscan?: string
  proxyConfirmations?: number
  openVaultConfirmations?: number
  safeConfirmations: number
  openVaultSafeConfirmations: number
}
// TODO to be moved to common

export interface OpenVaultStopLossSetup {
  withStopLossStage: boolean
  setStopLossCloseType: (type: CloseVaultTo) => void
  setStopLossLevel: (level: BigNumber) => void
  stopLossCloseType: CloseVaultTo
  stopLossLevel: BigNumber
  visitedStopLossStep: boolean
}

export type OpenVaultState = MutableOpenVaultState &
  OpenVaultCalculations &
  OpenVaultFunctions &
  OpenVaultEnvironment &
  OpenVaultConditions &
  OpenVaultTxInfo & {
    errorMessages: VaultErrorMessage[]
    warningMessages: VaultWarningMessage[]
    summary: OpenVaultSummary
    totalSteps: number
    currentStep: number
  } & OpenVaultStopLossSetup &
  HasGasEstimation
