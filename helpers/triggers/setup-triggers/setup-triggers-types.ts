import type BigNumber from 'bignumber.js'
import type { LendingProtocol } from 'lendingProtocols'

export enum TriggersApiErrorCode {
  MinSellPriceIsNotSet = 'min-sell-price-is-not-set',
  MaxBuyPriceIsNotSet = 'max-buy-price-is-not-set',
  ExecutionPriceBiggerThanMaxBuyPrice = 'execution-price-bigger-than-max-buy-price',
  ExecutionPriceSmallerThanMinSellPrice = 'execution-price-smaller-than-min-sell-price',
  ExecutionLTVSmallerThanTargetLTV = 'execution-ltv-smaller-than-target-ltv',
  ExecutionLTVBiggerThanTargetLTV = 'execution-ltv-bigger-than-target-ltv',
  ExecutionLTVBiggerThanCurrentLTV = 'execution-ltv-bigger-than-current-ltv',
  ExecutionLTVSmallerThanCurrentLTV = 'execution-ltv-smaller-than-current-ltv',
  ExecutionLTVIsNearToTheAutoSellTrigger = 'execution-ltv-is-near-to-the-auto-sell-trigger',
  InternalError = 'internal-error',
}

export type TriggersApiError = {
  code: TriggersApiErrorCode
  message: string
  prams?: Record<string, string>
  path?: string[]
}

interface StrategyLike {
  collateralAddress: string
  debtAddress: string
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
}

export type SetupBasicAutoResponse = {
  errors?: TriggersApiError[]
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
