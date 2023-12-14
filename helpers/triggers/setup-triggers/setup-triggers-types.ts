export type TriggersApiErrorCode =
  | 'custom'
  | 'invalid'
  | 'not_found'
  | 'required'
  | 'internal_error'

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
    collateralAmountAfterBuy: string
    collateralAmountToBuy: string
    debtAmountAfterBuy: string
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
