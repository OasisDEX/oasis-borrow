import { LendingProtocol } from 'lendingProtocols'

export const TRIGGERS_PRICE_DECIMALS = 8

export const supportedLambdaProtocolsList = [LendingProtocol.AaveV3, LendingProtocol.SparkV3]
export type SupportedLambdaProtocols = LendingProtocol.AaveV3 | LendingProtocol.SparkV3
