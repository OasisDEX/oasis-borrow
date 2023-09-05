import { NetworkIds } from 'blockchain/networks'

export type SparkV3SupportedNetwork = NetworkIds.MAINNET

export function ensureIsSupportedSparkV3NetworkId(
  networkId: number,
): asserts networkId is SparkV3SupportedNetwork {
  if (![NetworkIds.MAINNET].includes(networkId)) {
    throw new Error(`Unsupported Spark V3 network id: ${networkId}`)
  }
}
