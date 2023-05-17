import { NetworkIds } from 'blockchain/networkIds'

export type AaveV3SupportedNetwork = NetworkIds.MAINNET | NetworkIds.OPTIMISMMAINNET

export function ensureIsSupportedAaveV3NetworkId(
  networkId: number,
): asserts networkId is AaveV3SupportedNetwork {
  if (![NetworkIds.MAINNET, NetworkIds.OPTIMISMMAINNET].includes(networkId)) {
    throw new Error(`Unsupported network id: ${networkId}`)
  }
}
