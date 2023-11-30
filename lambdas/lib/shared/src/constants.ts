import { ChainId, ProtocolId } from './domain-types'

// share constants here
export const USD_DECIMALS = 8n

export const MIGRATION_SUPPORTED_CHAIN_IDS = [
  ChainId.MAINNET,
  ChainId.ARBITRUM,
  ChainId.OPTIMISM,
  ChainId.BASE,
  ChainId.SEPOLIA,
]

export const MIGRATION_SUPPORTED_PROTOCOL_IDS = [ProtocolId.AAVE3, ProtocolId.SPARK]
