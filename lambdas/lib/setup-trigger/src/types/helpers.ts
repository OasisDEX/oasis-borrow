import {
  AaveAutoBuyTriggerData,
  AaveAutoSellTriggerData,
  TriggerData,
  ValidationResults,
} from './types'
import { z, ZodIssueCode } from 'zod'
import { tokenSchema } from './validators'
import { SafeParseError, SafeParseReturnType } from 'zod/lib/types'

export const isAaveAutoBuyTriggerData = (
  triggerData: TriggerData,
): triggerData is AaveAutoBuyTriggerData => {
  return 'maxBuyPrice' in triggerData
}

export const isAaveAutoSellTriggerData = (
  triggerData: TriggerData,
): triggerData is AaveAutoSellTriggerData => {
  return 'minSellPrice' in triggerData
}

export const mapZodResultToValidationResults = <TInput>(
  zodReturn: SafeParseError<TInput>,
): ValidationResults => {
  return {
    success: false,
    errors: zodReturn.error.errors.map((error) => ({
      message: error.message,
      code: error.code === ZodIssueCode.custom ? error.params?.code : error.code,
      path: error.path,
    })),
  }
}
