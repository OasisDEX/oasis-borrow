import { NetworkIds } from 'blockchain/networkIds'

export type AaveV3SupportedNetwork = NetworkIds.MAINNET

export function ensureIsSupportedAaveV3NetworkId(
  networkId: number,
): asserts networkId is AaveV3SupportedNetwork {
  if (networkId !== NetworkIds.MAINNET) {
    throw new Error(`Unsupported network id: ${networkId}`)
  }
}
