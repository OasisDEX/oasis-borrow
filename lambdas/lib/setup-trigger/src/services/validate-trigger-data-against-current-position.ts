import {
  ONE_PERCENT,
  positionSchema,
  priceSchema,
  aaveBasicBuyTriggerDataSchema,
  aaveBasicSellTriggerDataSchema,
  mapZodResultToValidationResults,
  ValidationResults,
  CustomIssueCodes,
} from '~types'
import { z, ZodIssueCode } from 'zod'

const validationSchema = z
  .object({
    position: positionSchema,
    executionPrice: priceSchema,
    triggerData: z.union([aaveBasicBuyTriggerDataSchema, aaveBasicSellTriggerDataSchema]),
  })
  .refine(
    ({ executionPrice, triggerData }) => {
      if ('maxBuyPrice' in triggerData) {
        return triggerData.maxBuyPrice && triggerData.maxBuyPrice > executionPrice
      }
      return true
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
    ({ executionPrice, triggerData }) => {
      if ('minSellPrice' in triggerData) {
        return triggerData.minSellPrice && triggerData.minSellPrice < executionPrice
      }
      return true
    },
    {
      message: 'Execution price is smaller than min sell price',
      params: {
        code: CustomIssueCodes.ExecutionPriceSmallerThanMinSellPrice,
      },
      path: ['triggerData', 'minSellPrice'],
    },
  )
  .refine(
    ({ triggerData }) => {
      return triggerData.executionLTV < triggerData.targetLTV
    },
    {
      message: 'Execution LTV is smaller than target LTV',
      params: {
        code: CustomIssueCodes.ExecutionLTVSmallerThanTargetLTV,
      },
    },
  )
  .refine(
    ({ position, triggerData }) => {
      return triggerData.executionLTV <= position.ltv - ONE_PERCENT
    },
    {
      message: 'Execution LTV is bigger than current LTV',
      params: {
        code: CustomIssueCodes.ExecutionLTVBiggerThanCurrentLTV,
      },
    },
  )

export type ValidateParams = z.infer<typeof validationSchema>

export function validateTriggerDataAgainstCurrentPosition(
  params: ValidateParams,
): ValidationResults {
  const validationResult = validationSchema.safeParse(params)

  if (validationResult.success) {
    return {
      success: true,
      errors: [],
    }
  }

  return mapZodResultToValidationResults(validationResult)
}
