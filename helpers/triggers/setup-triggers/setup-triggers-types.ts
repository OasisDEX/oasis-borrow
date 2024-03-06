import type BigNumber from 'bignumber.js'
import type { SupportedLambdaProtocols } from 'helpers/triggers/common'

export enum TriggersApiErrorCode {
  MinSellPriceIsNotSet = 'min-sell-price-is-not-set',
  MaxBuyPriceIsNotSet = 'max-buy-price-is-not-set',
  StopLossTriggerLowerThanAutoBuy = 'stop-loss-trigger-ltv-lower-than-auto-buy',
  ExecutionPriceBiggerThanMaxBuyPrice = 'execution-price-bigger-than-max-buy-price',
  ExecutionPriceSmallerThanMinSellPrice = 'execution-price-smaller-than-min-sell-price',
  ExecutionLTVSmallerThanTargetLTV = 'execution-ltv-smaller-than-target-ltv',
  ExecutionLTVBiggerThanTargetLTV = 'execution-ltv-bigger-than-target-ltv',
  ExecutionLTVBiggerThanCurrentLTV = 'execution-ltv-bigger-than-current-ltv',
  ExecutionLTVLowerThanCurrentLTV = 'execution-ltv-lower-than-current-ltv',
  ExecutionLTVIsNearToTheAutoSellTrigger = 'execution-ltv-is-near-to-the-auto-sell-trigger',
  AutoSellTriggerHigherThanAutoBuyTarget = 'auto-sell-trigger-higher-than-auto-buy-target',
  AutoBuyTriggerLowerThanAutoSellTarget = 'auto-buy-trigger-lower-than-auto-sell-target',
  AutoSellCannotBeDefinedWithCurrentStopLoss = 'auto-sell-cannot-be-defined-with-current-stop-loss',
  AutoBuyCannotBeDefinedWithCurrentStopLoss = 'auto-buy-cannot-be-defined-with-current-stop-loss',
  InternalError = 'internal-error',
  TooLowLtvToSetupAutoBuy = 'too-low-ltv-to-setup-auto-buy',
  TooLowLtvToSetupAutoSell = 'too-low-ltv-to-setup-auto-sell',
  AutoSellNotAvailableDueToTooHighStopLoss = 'auto-sell-not-available-due-to-too-high-stop-loss',
  StopLossTriggerAlreadyExists = 'stop-loss-trigger-already-exists',
  StopLossTriggerDoesNotExist = 'stop-loss-trigger-does-not-exist',
  DebtTooHighToSetupStopLoss = 'debt-too-high-to-setup-stop-loss',
  StopLossTriggeredByAutoBuy = 'stop-loss-triggered-by-auto-buy',
  StopLossNeverTriggeredWithNoAutoSellMinSellPrice = 'stop-loss-never-triggered-with-no-auto-sell-min-sell-price',
  StopLossNeverTriggeredWithLowerAutoSellMinSellPrice = 'stop-loss-never-triggered-with-lower-auto-sell-min-sell-price',
  AutoSellNeverTriggeredWithCurrentStopLoss = 'auto-sell-never-triggered-with-current-stop-loss',
}

export enum TriggersApiWarningCode {
  NoMinSellPriceWhenStopLoss = 'no-min-sell-price-when-stop-loss-enabled',
  AutoBuyWithNoMaxPriceThreshold = 'auto-buy-with-no-max-price-threshold',
  AutoSellTriggerCloseToStopLossTrigger = 'auto-sell-trigger-close-to-stop-loss-trigger',
  AutoSellTargetCloseToAutoBuyTrigger = 'auto-sell-target-close-to-auto-buy-trigger',
  StopLossTriggerCloseToAutoSellTrigger = 'stop-loss-trigger-close-to-auto-sell-trigger',
  AutoBuyTargetCloseToStopLossTrigger = 'auto-buy-target-close-to-stop-loss-trigger',
  AutoBuyTargetCloseToAutoSellTrigger = 'auto-buy-target-close-to-auto-sell-trigger',
  AutoBuyTriggeredImmediately = 'auto-buy-triggered-immediately',
  AutoSellTriggeredImmediately = 'auto-sell-triggered-immediately',
  AutoBuyTriggerCloseToStopLossTrigger = 'auto-buy-trigger-close-to-stop-loss-trigger',
  AutoSellWithNoMinPriceThreshold = 'auto-sell-with-no-min-price-threshold',
  StopLossTriggeredImmediately = 'stop-loss-triggered-immediately',
  StopLossMakesAutoSellNotTrigger = 'stop-loss-makes-auto-sell-not-trigger',
}

export type TriggersApiError = {
  code: TriggersApiErrorCode
  message: string
  path?: string[]
}

export type TriggersApiWarning = {
  code: TriggersApiWarningCode
  message: string
  path?: string[]
}

type ResponseCommon = {
  errors?: TriggersApiError[]
  warnings?: TriggersApiWarning[]
}

interface StrategyLike {
  collateralAddress: string
  debtAddress: string
}

export enum TriggerAction {
  Add = 'add',
  Remove = 'remove',
  Update = 'update',
}

export type TriggerTransaction = {
  data: string
  to: string
}

export interface SetupAaveBasicAutomationParams {
  price: BigNumber | undefined
  executionLTV: BigNumber
  targetLTV: BigNumber
  maxBaseFee: BigNumber
  usePrice: boolean
  dpm: string
  strategy: StrategyLike
  networkId: number
  protocol: SupportedLambdaProtocols
  action: TriggerAction
}

export type SetupBasicAutoResponse = ResponseCommon & {
  encodedTriggerData?: string
  simulation?: {
    collateralAmountAfterExecution: string
    debtAmountAfterExecution: string
    executionLTV: string
    targetLTV: string
    targetLTVWithDeviation: [string, string]
    targetMultiple: string
  }
  transaction?: TriggerTransaction
}

export type SetupBasicStopLossResponse = ResponseCommon & {
  encodedTriggerData?: string
  simulation?: {
    collateralAmountAfterExecution: string
    debtAmountAfterExecution: string
    executionLTV: string
    targetLTV: string
    targetLTVWithDeviation: [string, string]
    targetMultiple: string
  }
  transaction?: TriggerTransaction
}

export interface SetupAaveStopLossParams {
  executionToken: string
  executionLTV: BigNumber
  targetLTV: BigNumber
  dpm: string
  strategy: StrategyLike
  networkId: number
  protocol: SupportedLambdaProtocols
  action: TriggerAction
}

export interface SetupAaveTrailingStopLossParams {
  dpm: string
  executionToken: string
  trailingDistance: BigNumber
  networkId: number
  strategy: StrategyLike
  protocol: SupportedLambdaProtocols
  action: TriggerAction
}

export type SetupTrailingStopLossResponse = ResponseCommon & {
  encodedTriggerData?: string
  simulation?: unknown
  transaction?: TriggerTransaction
}

export interface SetupAavePartialTakeProfitParams {
  dpm: string
  executionToken: string
  triggerLtv: BigNumber
  withdrawalLtv: BigNumber
  startingTakeProfitPrice: BigNumber
  stopLoss?: BigNumber
  trailingStopLoss?: BigNumber
  networkId: number
  strategy: StrategyLike
  protocol: SupportedLambdaProtocols
  action: TriggerAction
}

interface ProfitsSimulationToken {
  decimals: number
  symbol: string
  address: string
}

export interface ProfitsSimulationBalanceRaw {
  balance: string
  token: ProfitsSimulationToken
}

interface ProfitsSimulationRaw {
  triggerPrice: string
  realizedProfitInCollateral: ProfitsSimulationBalanceRaw
  realizedProfitInDebt: ProfitsSimulationBalanceRaw
  totalProfitInCollateral: ProfitsSimulationBalanceRaw
  totalProfitInDebt: ProfitsSimulationBalanceRaw
  stopLossDynamicPrice: string
  fee: ProfitsSimulationBalanceRaw
  totalFee: ProfitsSimulationBalanceRaw
}

interface ProfitsSimulationBalanceMapped {
  balance: BigNumber
  token: ProfitsSimulationToken
}

export interface ProfitsSimulationMapped {
  triggerPrice: BigNumber
  realizedProfitInCollateral: ProfitsSimulationBalanceMapped
  realizedProfitInDebt: ProfitsSimulationBalanceMapped
  totalProfitInCollateral: ProfitsSimulationBalanceMapped
  totalProfitInDebt: ProfitsSimulationBalanceMapped
  stopLossDynamicPrice: BigNumber
  fee: ProfitsSimulationBalanceMapped
  totalFee: ProfitsSimulationBalanceMapped
}

export type SetupPartialTakeProfitResponse = {
  errors?: TriggersApiError[]
  warnings?: TriggersApiWarning[]
  encodedTriggerData?: string
  simulation?: {
    profits: ProfitsSimulationRaw[]
  }
  transaction?: TriggerTransaction
}

export type SetupBasicAutoResponseWithRequiredTransaction = SetupBasicAutoResponse & {
  transaction: TriggerTransaction
}

export const hasTransaction = (
  response: SetupBasicAutoResponse,
): response is SetupBasicAutoResponseWithRequiredTransaction => !!response.transaction
