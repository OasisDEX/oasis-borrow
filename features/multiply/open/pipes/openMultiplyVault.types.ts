import type { BigNumber } from 'bignumber.js'
import type { IlkData } from 'blockchain/ilks.types'
import type { AllowanceChanges, AllowanceOption } from 'features/allowance/allowance.types'
import type {
  OpenVaultStopLossChanges,
  StopLossOpenFlowStages,
} from 'features/automation/protection/stopLoss/openFlow/openVaultStopLoss.types'
import type { OpenVaultStopLossSetup } from 'features/borrow/open/pipes/openVault.types'
import type { Quote } from 'features/exchange/exchange'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import type { ProxyChanges } from 'features/proxy/proxy.types'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import type { OpenVaultTransactionChange } from 'features/shared/transactions'
import type { OpenVaultTransitionChange } from 'features/vaultTransitions/openVaultTransitions'
import type { TxError } from 'helpers/types'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'

import type { ExchangeQuoteChanges } from './openMultiplyQuote.types'
import type { OpenMultiplyVaultCalculations } from './openMultiplyVaultCalculations.types'
import type { OpenMultiplyVaultConditions } from './openMultiplyVaultConditions.types'
import type { OpenVaultEnvironmentChange } from './openMultiplyVaultEnvironment.types'
import type { OpenVaultInputChange } from './openMultiplyVaultInput.types'
import type { OpenVaultSummary } from './openMultiplyVaultSummary.types'

interface OpenVaultInjectedOverrideChange {
  kind: 'injectStateOverride'
  stateToOverride: Partial<OpenMultiplyVaultState>
}

export type OpenMultiplyVaultChange =
  | OpenVaultInputChange
  | OpenVaultTransitionChange
  | OpenVaultTransactionChange
  | AllowanceChanges
  | ProxyChanges
  | OpenVaultEnvironmentChange
  | OpenVaultInjectedOverrideChange
  | ExchangeQuoteChanges
  | OpenVaultStopLossChanges

export type ProxyStages =
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFailure'
  | 'proxySuccess'
export type AllowanceStages =
  | 'allowanceWaitingForConfirmation'
  | 'allowanceWaitingForApproval'
  | 'allowanceInProgress'
  | 'allowanceFailure'
  | 'allowanceSuccess'

export type TxStage =
  | 'txWaitingForConfirmation'
  | 'txWaitingForApproval'
  | 'txInProgress'
  | 'txFailure'
  | 'txSuccess'

export type EditingStage = 'editing'
export type OpenMultiplyVaultStage =
  | EditingStage
  | ProxyStages
  | AllowanceStages
  | TxStage
  | StopLossOpenFlowStages

export interface MutableOpenMultiplyVaultState {
  stage: OpenMultiplyVaultStage
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  selectedAllowanceRadio: AllowanceOption
  allowanceAmount?: BigNumber
  id?: BigNumber
  requiredCollRatio?: BigNumber
  stopLossSkipped: boolean
  stopLossLevel: BigNumber
}
interface OpenMultiplyVaultFunctions {
  progress?: () => void
  regress?: () => void
  skipStopLoss?: () => void
  updateDeposit?: (depositAmount?: BigNumber) => void
  updateDepositUSD?: (depositAmountUSD?: BigNumber) => void
  updateDepositMax?: () => void
  updateRequiredCollRatio?: (requiredCollRatio?: BigNumber) => void
  updateAllowanceAmount?: (amount?: BigNumber) => void
  setAllowanceAmountUnlimited?: () => void
  setAllowanceAmountToDepositAmount?: () => void
  setAllowanceAmountCustom?: () => void
  clear: () => void
  injectStateOverride: (state: Partial<MutableOpenMultiplyVaultState>) => void
}
interface OpenMultiplyVaultEnvironment {
  ilk: string
  account: string
  token: string
  priceInfo: PriceInfo
  balanceInfo: BalanceInfo
  ilkData: IlkData
  proxyAddress?: string
  allowance?: BigNumber
  quote?: Quote
  swap?: Quote
  exchangeError: boolean
  slippage: BigNumber
}
interface OpenMultiplyVaultTxInfo {
  allowanceTxHash?: string
  proxyTxHash?: string
  openTxHash?: string
  txError?: TxError
  etherscan?: string
  proxyConfirmations?: number
  safeConfirmations: number
  openVaultConfirmations?: number
  openVaultSafeConfirmations: number
}

export type OpenMultiplyVaultState = MutableOpenMultiplyVaultState &
  OpenMultiplyVaultCalculations &
  OpenMultiplyVaultFunctions &
  OpenMultiplyVaultEnvironment &
  OpenMultiplyVaultConditions &
  OpenMultiplyVaultTxInfo & {
    errorMessages: VaultErrorMessage[]
    warningMessages: VaultWarningMessage[]
    summary: OpenVaultSummary
    totalSteps: number
    currentStep: number
  } & OpenVaultStopLossSetup &
  HasGasEstimation
