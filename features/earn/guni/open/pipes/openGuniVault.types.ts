import type { BigNumber } from 'bignumber.js'
import type {
  AllowanceChanges,
  AllowanceFunctions,
  AllowanceStages,
  AllowanceState,
} from 'features/allowance/allowance.types'
import type { Quote } from 'features/exchange/exchange'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import type { TxStage } from 'features/multiply/open/pipes/openMultiplyVault.types'
import type { ProxyChanges, ProxyStages, ProxyState } from 'features/proxy/proxy.types'
import type { TxError } from 'helpers/types'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'

import type { EnvironmentChange, EnvironmentState } from './enviroment'
import type { EditingStage, FormChanges, FormFunctions, FormState } from './guniForm'
import type { GuniOpenMultiplyVaultConditions } from './openGuniVaultConditions.types'

export type InjectChange = {
  kind: 'injectStateOverride'
  stateToOverride: Partial<OpenGuniVaultState>
}

export interface OverrideHelper {
  injectStateOverride: (state: Partial<any>) => void
}

export type Stage = EditingStage | ProxyStages | AllowanceStages | TxStage

export interface StageState {
  stage: Stage
}

export interface VaultTxInfo {
  txError?: TxError
  etherscan?: string
  safeConfirmations: number
}

export interface StageFunctions {
  progress?: () => void
  regress?: () => void
  clear: () => void
}

export interface ExchangeState {
  quote?: Quote
  swap?: Quote
  exchangeError: boolean
  slippage: BigNumber
}

export type ExchangeChange =
  | { kind: 'quote'; quote: Quote }
  | { kind: 'swap'; swap: Quote }
  | { kind: 'exchangeError' }

export type OpenGuniChanges =
  | EnvironmentChange
  | FormChanges
  | InjectChange
  | ProxyChanges
  | AllowanceChanges

export type ErrorState = {
  errorMessages: VaultErrorMessage[]
}

export type WarringState = {
  warningMessages: VaultWarningMessage[]
}

export type OpenGuniVaultState = OverrideHelper &
  StageState &
  StageFunctions &
  AllowanceState &
  AllowanceFunctions &
  FormFunctions &
  FormState &
  EnvironmentState &
  ExchangeState &
  VaultTxInfo &
  ErrorState &
  WarringState &
  ProxyState &
  GuniCalculations &
  TokensLpBalanceState &
  GuniOpenMultiplyVaultConditions & {
    // TODO - ADDED BY SEBASTIAN TO BE REMOVED
    maxMultiple: BigNumber
    afterOutstandingDebt: BigNumber
    multiply: BigNumber
    totalCollateral: BigNumber // it was not available in standard multiply state
    afterNetValueUSD: BigNumber
    maxDepositAmount: BigNumber
    txFees: BigNumber
    impact: BigNumber
    loanFees: BigNumber
    oazoFee: BigNumber
    gettingCollateral: BigNumber // it was not available in standard multiply state
    gettingCollateralUSD: BigNumber // it was not available in standard multiply state
    buyingCollateralUSD: BigNumber
    maxGenerateAmount: BigNumber
    totalSteps: number
    currentStep: number
    netValueUSD: BigNumber
    minToTokenAmount: BigNumber
    requiredDebt?: BigNumber
    currentPnL: BigNumber
    totalGasSpentUSD: BigNumber
    id?: BigNumber
  } & HasGasEstimation

export interface GuniCalculations {
  leveragedAmount?: BigNumber
  flAmount?: BigNumber
}

export interface TokensLpBalanceState {
  token0Amount?: BigNumber
  token1Amount?: BigNumber
}

export interface GuniTxData {
  swap?: Quote
  flAmount?: BigNumber
  leveragedAmount?: BigNumber
  token0Amount?: BigNumber
  token1Amount?: BigNumber
  amount0?: BigNumber
  amount1?: BigNumber
  fromTokenAmount?: BigNumber
  toTokenAmount?: BigNumber
  minToTokenAmount?: BigNumber
  afterCollateralAmount?: BigNumber
  afterOutstandingDebt?: BigNumber
  requiredDebt?: BigNumber
  oazoFee?: BigNumber
  totalFees?: BigNumber
  totalCollateral?: BigNumber
  gettingCollateral: BigNumber
  gettingCollateralUSD: BigNumber
  afterNetValueUSD: BigNumber
  buyingCollateralUSD: BigNumber
  multiply: BigNumber
}

export type GuniTxDataChange = { kind: 'guniTxData' } & GuniTxData
