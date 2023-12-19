import {
  ONE_PERCENT,
  positionSchema,
  priceSchema,
  aaveBasicBuyTriggerDataSchema,
  aaveBasicSellTriggerDataSchema,
  mapZodResultToValidationResults,
  ValidationResults,
  CustomIssueCodes,
  eventBodyAaveBasicBuySchema,
} from '~types'
import { z, ZodIssueCode } from 'zod'

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
        code: CustomIssueCodes.ExecutionPriceBiggerThanMaxBuyPrice,
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
        code: CustomIssueCodes.ExecutionLTVSmallerThanTargetLTV,
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
        code: CustomIssueCodes.ExecutionLTVBiggerThanCurrentLTV,
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
    }
  }

  return mapZodResultToValidationResults(validationResult)
}
