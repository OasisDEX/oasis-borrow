import { z } from 'zod'
import {
  aaveBasicBuyTriggerDataSchema,
  aaveBasicSellTriggerDataSchema,
  eventBodyAaveBasicBuySchema,
  ltvSchema,
  pathParamsSchema,
  positionSchema,
  priceSchema,
  tokenBalanceSchema,
  tokenSchema,
} from './validators'

export type EventBody = z.infer<typeof eventBodyAaveBasicBuySchema>
export type PathParams = z.infer<typeof pathParamsSchema>
export type PositionLike = z.infer<typeof positionSchema>
export type Token = z.infer<typeof tokenSchema>
export type TokenBalance = z.infer<typeof tokenBalanceSchema>
export type Price = z.infer<typeof priceSchema>
export type LTV = z.infer<typeof ltvSchema>
export type AaveAutoBuyTriggerData = z.infer<typeof aaveBasicBuyTriggerDataSchema>
export type AaveAutoSellTriggerData = z.infer<typeof aaveBasicSellTriggerDataSchema>
export type TriggerData = AaveAutoBuyTriggerData | AaveAutoSellTriggerData

export enum CustomIssueCodes {
  MinSellPriceIsNotSet = 'min-sell-price-is-not-set',
  MaxBuyPriceIsNotSet = 'max-buy-price-is-not-set',
  ExecutionPriceBiggerThanMaxBuyPrice = 'execution-price-bigger-than-max-buy-price',
  ExecutionPriceSmallerThanMinSellPrice = 'execution-price-smaller-than-min-sell-price',
  ExecutionLTVSmallerThanTargetLTV = 'execution-ltv-smaller-than-target-ltv',
  ExecutionLTVBiggerThanCurrentLTV = 'execution-ltv-bigger-than-current-ltv',
  ExecutionLTVIsNearToTheAutoSellTrigger = 'execution-ltv-is-near-to-the-auto-sell-trigger',
}

export type Issue = { message: string; code: string; path: (string | number)[] }

export type ValidationResults = {
  success: boolean
  errors: Issue[]
}
