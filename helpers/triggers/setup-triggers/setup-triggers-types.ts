import type BigNumber from 'bignumber.js'
import type { LendingProtocol } from 'lendingProtocols'

export enum AutoBuyTriggerCustomErrorCodes {}

export enum AutoBuyTriggerCustomWarningCodes {}

export enum AutoSellTriggerCustomErrorCodes {}

export enum AutoSellTriggerCustomWarningCodes {}

export enum TriggersApiErrorCode {
  MinSellPriceIsNotSet = 'min-sell-price-is-not-set',
  MaxBuyPriceIsNotSet = 'max-buy-price-is-not-set',
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
}

export type TriggersApiError = {
  code: TriggersApiErrorCode
  message: string
  prams?: Record<string, string>
  path?: string[]
}

export type TriggersApiWarning = {
  code: TriggersApiWarningCode
  message: string
  prams?: Record<string, string>
  path?: string[]
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

export interface SetupAaveBasicAutomationParams {
  price: BigNumber | undefined
  executionLTV: BigNumber
  targetLTV: BigNumber
  maxBaseFee: BigNumber
  usePrice: boolean
  dpm: string
  strategy: StrategyLike
  triggerType: number
  networkId: number
  protocol: LendingProtocol
  action: TriggerAction
}

export type SetupBasicAutoResponse = {
  errors?: TriggersApiError[]
  warnings?: TriggersApiWarning[]
  encodedTriggerData?: string
  simulation?: {
    collateralAmountAfterExecution: string
    debtAmountAfterExecution: string
    executionLTV: string
    targetLTV: string
    targetLTVWithDeviation: [string, string]
    targetMultiple: string
  }
  transaction?: {
    data: string
    to: string
  }
}

export type SetupBasicAutoResponseWithRequiredTransaction = SetupBasicAutoResponse & {
  transaction: { data: string; to: string }
}

export const hasTransaction = (
  response: SetupBasicAutoResponse,
): response is SetupBasicAutoResponseWithRequiredTransaction => !!response.transaction
