import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { SelectedDaiAllowanceRadio } from 'components/vault/commonMultiply/ManageVaultDaiAllowance'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { Quote } from 'features/exchange/exchange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { BaseManageVaultStage } from 'features/types/vaults/BaseManageVaultStage'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { HasGasEstimation } from 'helpers/context/types'
import { TxError } from 'helpers/types'

import { ExchangeQuoteChanges } from './manageMultiplyQuote'
import { ManageVaultAllowanceChange } from './manageMultiplyVaultAllowances'
import { ManageVaultCalculations } from './manageMultiplyVaultCalculations'
import { ManageVaultConditions } from './manageMultiplyVaultConditions'
import { ManageVaultEnvironmentChange } from './manageMultiplyVaultEnvironment'
import { ManageVaultFormChange } from './manageMultiplyVaultForm'
import { ManageVaultInputChange } from './manageMultiplyVaultInput'
import { ManageVaultSummary } from './manageMultiplyVaultSummary'
import { ManageVaultTransactionChange } from './manageMultiplyVaultTransactions'
import { ManageVaultTransitionChange } from './manageMultiplyVaultTransitions'

export interface ManageVaultInjectedOverrideChange {
  kind: 'injectStateOverride'
  stateToOverride: Partial<ManageMultiplyVaultState>
}

export type ManageMultiplyVaultChange =
  | ManageVaultInputChange
  | ManageVaultFormChange
  | ManageVaultAllowanceChange
  | ManageVaultTransitionChange
  | ManageVaultTransactionChange
  | ManageVaultEnvironmentChange
  | ManageVaultInjectedOverrideChange
  | ExchangeQuoteChanges

export type ManageMultiplyVaultEditingStage =
  | 'adjustPosition'
  | 'otherActions'
  | 'borrowTransitionEditing'

export type ManageMultiplyVaultStage =
  | ManageMultiplyVaultEditingStage
  | BaseManageVaultStage
  | 'borrowTransitionWaitingForConfirmation'
  | 'borrowTransitionInProgress'
  | 'borrowTransitionFailure'
  | 'borrowTransitionSuccess'

export type MainAction = 'buy' | 'sell'
export type CloseVaultTo = 'collateral' | 'dai'
export type OtherAction =
  | 'depositCollateral'
  | 'depositDai'
  | 'paybackDai'
  | 'withdrawCollateral'
  | 'withdrawDai'
  | 'closeVault'

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

export interface ManageVaultEnvironment {
  account?: string
  accountIsController: boolean
  proxyAddress?: string
  collateralAllowance?: BigNumber
  daiAllowance?: BigNumber
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  priceInfo: PriceInfo
  quote?: Quote
  swap?: Quote
  exchangeError: boolean
  slippage: BigNumber
  vaultHistory: VaultHistoryEvent[]
}

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

export interface ManageVaultTxInfo {
  collateralAllowanceTxHash?: string
  daiAllowanceTxHash?: string
  proxyTxHash?: string
  manageTxHash?: string
  txError?: TxError
  etherscan?: string
  proxyConfirmations?: number
  safeConfirmations: number
}

export type ManageMultiplyVaultState = MutableManageMultiplyVaultState &
  ManageVaultCalculations &
  ManageVaultConditions &
  ManageVaultEnvironment &
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
