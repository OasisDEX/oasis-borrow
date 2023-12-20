import {
  CustomErrorCodes,
  eventBodyAaveBasicSellSchema,
  mapZodResultToValidationResults,
  positionSchema,
  priceSchema,
  ValidationResults,
} from '~types'
import { z } from 'zod'

const validationSchema = z
  .object({
    position: positionSchema,
    executionPrice: priceSchema,
    body: eventBodyAaveBasicSellSchema,
  })
  .refine(
    ({ executionPrice, body }) => {
      return !body.triggerData.useMinSellPrice || body.triggerData.minSellPrice < executionPrice
    },
    {
      message: 'Execution price is smaller than min sell price',
      params: {
        code: CustomErrorCodes.ExecutionPriceSmallerThanMinSellPrice,
      },
      path: ['triggerData', 'minSellPrice'],
    },
  )
  .refine(
    ({ body }) => {
      return body.triggerData.targetLTV < body.triggerData.executionLTV
    },
    {
      message: 'Execution LTV is bigger than target LTV',
      params: {
        code: CustomErrorCodes.ExecutionLTVBiggerThanTargetLTV,
      },
    },
  )

export type AutoSellTriggerParams = z.infer<typeof validationSchema>

export function autoSellValidator(params: AutoSellTriggerParams): ValidationResults {
  const validationResult = validationSchema.safeParse(params)

  if (validationResult.success) {
    return {
      success: true,
      errors: [],
      warnings: [],
    }
  }

  return mapZodResultToValidationResults(validationResult)
}
