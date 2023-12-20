import {
  ONE_PERCENT,
  positionSchema,
  priceSchema,
  mapZodResultToValidationResults,
  ValidationResults,
  CustomErrorCodes,
  eventBodyAaveBasicBuySchema,
} from '~types'
import { z } from 'zod'

const validationSchema = z
  .object({
    position: positionSchema,
    executionPrice: priceSchema,
    body: eventBodyAaveBasicBuySchema,
  })
  .refine(
    ({ executionPrice, body }) => {
      return body.triggerData.maxBuyPrice && body.triggerData.maxBuyPrice > executionPrice
    },
    {
      message: 'Execution price is bigger than max buy price',
      params: {
        code: CustomErrorCodes.ExecutionPriceBiggerThanMaxBuyPrice,
      },
      path: ['triggerData', 'maxBuyPrice'],
    },
  )
  .refine(
    ({ body }) => {
      return body.triggerData.executionLTV < body.triggerData.targetLTV
    },
    {
      message: 'Execution LTV is smaller than target LTV',
      params: {
        code: CustomErrorCodes.ExecutionLTVSmallerThanTargetLTV,
      },
    },
  )
  .refine(
    ({ position, body }) => {
      return body.triggerData.executionLTV <= position.ltv - ONE_PERCENT
    },
    {
      message: 'Execution LTV is bigger than current LTV',
      params: {
        code: CustomErrorCodes.ExecutionLTVBiggerThanCurrentLTV,
      },
    },
  )

export type AutoBuyValidationParams = z.infer<typeof validationSchema>

export function autoBuyValidator(params: AutoBuyValidationParams): ValidationResults {
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
