import { LendingProtocol } from 'lendingProtocols'

export const TRIGGERS_PRICE_DECIMALS = 8

export const supportedLambdaProtocolsList = [
  LendingProtocol.AaveV3,
  LendingProtocol.MorphoBlue,
  LendingProtocol.SparkV3,
] as const

export type SupportedLambdaProtocols = (typeof supportedLambdaProtocolsList)[number]

export type SetupTriggerPath =
  | 'auto-buy'
  | 'auto-sell'
  | 'dma-stop-loss'
  | 'dma-trailing-stop-loss'
  | 'dma-partial-take-profit'
