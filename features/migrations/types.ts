import { NetworkIds } from 'blockchain/networks'
import { LendingProtocol } from 'lendingProtocols'

export enum ChainId {
  MAINNET = 1,
  ARBITRUM = 42161,
  OPTIMISM = 10,
  BASE = 8453,
  SEPOLIA = 11155111,
}

export const isChainId = (chainId: unknown): chainId is ChainId => {
  if (typeof chainId !== 'number') {
    return false
  }
  return Object.values(ChainId).includes(chainId)
}

export enum ProtocolId {
  AAVE3 = 'aave3',
  SPARK = 'spark',
}

export const LendingProtocolByProtocolId: Record<ProtocolId, LendingProtocol> = {
  [ProtocolId.AAVE3]: LendingProtocol.AaveV3,
  [ProtocolId.SPARK]: LendingProtocol.SparkV3,
}

export const NetworkIdByChainId: Record<ChainId, NetworkIds> = {
  [ChainId.MAINNET]: NetworkIds.MAINNET,
  [ChainId.ARBITRUM]: NetworkIds.ARBITRUMMAINNET,
  [ChainId.OPTIMISM]: NetworkIds.OPTIMISMMAINNET,
  [ChainId.BASE]: NetworkIds.BASEMAINNET,
  [ChainId.SEPOLIA]: NetworkIds.EMPTYNET,
}

export const isProtocolId = (protocolId: unknown): protocolId is ProtocolId => {
  if (typeof protocolId !== 'string') {
    return false
  }
  return Object.values(ProtocolId).includes(protocolId as ProtocolId)
}

export type PortfolioMigrationAsset = {
  symbol: string
  balance: string
  balanceDecimals: string
  price: string
  priceDecimals: string
  usdValue: number
}

export type PortfolioMigration = {
  chainId: ChainId
  protocolId: ProtocolId
  collateralAsset: PortfolioMigrationAsset
  debtAsset: PortfolioMigrationAsset
}

export type PortfolioMigrationsResponse = {
  migrations: PortfolioMigration[]
}
