import {
  ONE_PERCENT,
  positionSchema,
  priceSchema,
  aaveBasicBuyTriggerDataSchema,
  aaveBasicSellTriggerDataSchema,
} from '~types'
import { z, ZodIssueCode } from 'zod'

type Issue = { message: string; code: string; path: (string | number)[] }

export interface ValidationResults {
  success: boolean
  error: Issue[]
}

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
        code: 'execution-price-bigger-than-max-buy-price',
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
        code: 'execution-price-smaller-than-min-sell-price',
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
        code: 'execution-ltv-smaller-than-target-ltv',
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
        code: 'execution-ltv-bigger-than-current-ltv',
      },
    },
  )

export type ValidateParams = z.infer<typeof validationSchema>

export function validateTriggerDataAgainstCurrentPosition(
  params: ValidateParams,
): ValidationResults {
  const validationResult = validationSchema.safeParse(params)

  const errors: Issue[] = !validationResult.success
    ? validationResult.error.errors.map((error) => {
        return {
          message: error.message,
          code: error.code === ZodIssueCode.custom ? error.params?.code : error.code,
          path: error.path,
        }
      })
    : []

  return {
    success: validationResult.success,
    error: errors,
  }
}
