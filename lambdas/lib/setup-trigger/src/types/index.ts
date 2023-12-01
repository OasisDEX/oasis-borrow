import {
  pathParamsSchema,
  eventBodyAaveBasicBuySchema,
  positionAddressesSchema,
  tokenSchema,
  ONE_PERCENT,
  PERCENT_DECIMALS,
  PRICE_DECIMALS,
  positionSchema,
  tokenBalanceSchema,
  priceSchema,
  ltvSchema,
  aaveBasicBuyTriggerDataSchema,
  aaveBasicSellTriggerDataSchema,
} from './validators'
import { z } from 'zod'

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

export * from './validators'
