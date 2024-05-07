import type BigNumber from 'bignumber.js'
import type { SupportedLambdaProtocols } from 'helpers/lambda/triggers/common'

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
  // Error: Your Partial Take Profit trigger LTV is higher than the target LTV of your Auto-Sell. Reduce your Partial Take Profit trigger, or update your Auto-Sell.
  PartialTakeProfitTriggerHigherThanAutoSellTarget = 'partial-take-profit-trigger-higher-than-auto-sell-target',
  // Error: Your Partial Take Profit target LTV is higher than the trigger LTV of your Auto-Sell. Reduce your Partial Take Profit target, or update your Auto-Sell.
  PartialTakeProfitTargetHigherThanAutoSellTrigger = 'partial-take-profit-target-higher-than-auto-sell-trigger',
  // Error: Your Partial Take Profit target LTV is higher than your Stop-Loss. Reduce your Partial Take Profit target, or update your Stop-Loss.
  PartialTakeProfitTargetHigherThanStopLoss = 'partial-take-profit-target-higher-than-stop-loss',
  // Error: Your Partial Take Profit min price is lower than the max price of your Auto-Buy. Increase your Partial Take Profit min price, or update your Auto-Buy
  PartialTakeProfitMinPriceLowerThanAutoBuyMaxPrice = 'partial-take-profit-min-price-lower-than-auto-buy-max-price',
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
  // Error: Your Partial Take Profit target LTV is higher than your Stop-Loss. Reduce your Partial Take Profit target, or update your Stop-Loss.
  PartialTakeProfitTargetHigherThanStopLoss = 'partial-take-profit-target-higher-than-stop-loss',
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

export interface SetupAutomationCommonParams {
  action: TriggerAction
  dpm: string
  networkId: number
  poolId?: string
  protocol: SupportedLambdaProtocols
  strategy: StrategyLike
}

export interface SetupAaveBasicAutomationParams extends SetupAutomationCommonParams {
  executionLTV: BigNumber
  maxBaseFee: BigNumber
  price: BigNumber | undefined
  targetLTV: BigNumber
  usePrice: boolean
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

export interface SetupAaveStopLossParams extends SetupAutomationCommonParams {
  executionLTV: BigNumber
  executionToken: string
}

export interface SetupAaveTrailingStopLossParams extends SetupAutomationCommonParams {
  executionToken: string
  trailingDistance: BigNumber
}

export type SetupTrailingStopLossResponse = ResponseCommon & {
  encodedTriggerData?: string
  simulation?: {
    somethingToBeUpdated: boolean
  }
  transaction?: TriggerTransaction
}

export interface SetupAavePartialTakeProfitParams extends SetupAutomationCommonParams {
  executionToken: string
  startingTakeProfitPrice: BigNumber
  stopLoss?: {
    triggerData: {
      executionLTV: BigNumber
      token: string
    }
    action: TriggerAction.Add | TriggerAction.Update
  }
  trailingStopLoss?: BigNumber
  triggerLtv: BigNumber
  withdrawalLtv: BigNumber
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

export interface ProfitsSimulationRaw {
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
