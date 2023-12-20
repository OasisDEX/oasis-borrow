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

export enum CustomErrorCodes {
  MinSellPriceIsNotSet = 'min-sell-price-is-not-set',
  MaxBuyPriceIsNotSet = 'max-buy-price-is-not-set',
  ExecutionPriceBiggerThanMaxBuyPrice = 'execution-price-bigger-than-max-buy-price',
  ExecutionPriceSmallerThanMinSellPrice = 'execution-price-smaller-than-min-sell-price',
  ExecutionLTVSmallerThanTargetLTV = 'execution-ltv-smaller-than-target-ltv',
  ExecutionLTVBiggerThanTargetLTV = 'execution-ltv-bigger-than-target-ltv',
  ExecutionLTVBiggerThanCurrentLTV = 'execution-ltv-bigger-than-current-ltv',
  ExecutionLTVSmallerThanCurrentLTV = 'execution-ltv-smaller-than-current-ltv',
  ExecutionLTVIsNearToTheAutoSellTrigger = 'execution-ltv-is-near-to-the-auto-sell-trigger',
  AutoSellTriggerHigherThanAutoBuyTarget = 'auto-sell-trigger-higher-than-auto-buy-target',
  AutoBuyTriggerLowerThanAutoSellTarget = 'auto-buy-trigger-lower-than-auto-sell-target',
  AutoSellCannotBeDefinedWithCurrentStopLoss = 'auto-sell-cannot-be-defined-with-current-stop-loss',
  AutoSellNotAvailableDueToCurrentLTV = 'auto-sell-not-available-due-to-current-ltv',
  AutoBuyCannotBeDefinedWithCurrentStopLoss = 'auto-buy-cannot-be-defined-with-current-stop-loss',
  AutoBuyNotAvailableDueToCurrentLTV = 'auto-buy-not-available-due-to-current-ltv',
}

export enum CustomWarningCodes {
  NoMinSellPriceWhenStopLoss = 'no-min-sell-price-when-stop-loss-enabled',
  AutoBuyWithNoMaxPriceThreshold = 'auto-buy-with-no-max-price-threshold',
  AutoSellTriggerCloseToStopLossTrigger = 'auto-sell-trigger-close-to-stop-loss-trigger',
  AutoSellTargetCloseToAutoBuyTrigger = 'auto-sell-target-close-to-auto-buy-trigger',
  StopLossTriggerCloseToAutoSellTrigger = 'stop-loss-trigger-close-to-auto-sell-trigger',
  AutoBuyTargetCloseToStopLossTrigger = 'auto-buy-target-close-to-stop-loss-trigger',
  AutoBuyTargetCloseToAutoSellTrigger = 'auto-buy-target-close-to-auto-sell-trigger',
  AutoBuyTriggeredImmediately = 'auto-buy-triggered-immediately',
  AutoSellTriggeredImmediately = 'auto-sell-triggered-immediately',
}

export type ValidationIssue = { message: string; code: string; path: (string | number)[] }

export type ValidationResults = {
  success: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}
