export enum TriggersApiErrorCode {
  MinSellPriceIsNotSet = 'min-sell-price-is-not-set',
  MaxBuyPriceIsNotSet = 'max-buy-price-is-not-set',
  ExecutionPriceBiggerThanMaxBuyPrice = 'execution-price-bigger-than-max-buy-price',
  ExecutionPriceSmallerThanMinSellPrice = 'execution-price-smaller-than-min-sell-price',
  ExecutionLTVSmallerThanTargetLTV = 'execution-ltv-smaller-than-target-ltv',
  ExecutionLTVBiggerThanCurrentLTV = 'execution-ltv-bigger-than-current-ltv',
  ExecutionLTVIsNearToTheAutoSellTrigger = 'execution-ltv-is-near-to-the-auto-sell-trigger',
  InternalError = 'internal-error',
}

export type TriggersApiError = {
  code: TriggersApiErrorCode
  message: string
  prams?: Record<string, string>
  path?: string[]
}

export type SetupAutoBuyResponse = {
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

export type SetupAutoBuyResponseWithRequiredTransaction = SetupAutoBuyResponse & {
  transaction: { data: string; to: string }
}

export const hasTransaction = (
  response: SetupAutoBuyResponse,
): response is SetupAutoBuyResponseWithRequiredTransaction => !!response.transaction
