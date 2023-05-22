import { NetworkIds } from 'blockchain/networks'

export type AaveV3SupportedNetwork = NetworkIds.MAINNET | NetworkIds.OPTIMISMMAINNET

export function ensureIsSupportedAaveV3NetworkId(
  networkId: number,
): asserts networkId is AaveV3SupportedNetwork {
  if (networkId !== NetworkIds.MAINNET && networkId !== NetworkIds.OPTIMISMMAINNET) {
    throw new Error(`Unsupported network id: ${networkId}`)
  }
}
