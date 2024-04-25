import { NetworkIds } from 'blockchain/networks'

export const aaveV3SupportedNetworkList = [
  NetworkIds.MAINNET,
  NetworkIds.OPTIMISMMAINNET,
  NetworkIds.ARBITRUMMAINNET,
  NetworkIds.BASEMAINNET,
]

export type AaveV3SupportedNetwork =
  | NetworkIds.MAINNET
  | NetworkIds.OPTIMISMMAINNET
  | NetworkIds.ARBITRUMMAINNET
  | NetworkIds.BASEMAINNET

export function ensureIsSupportedAaveV3NetworkId(
  networkId: number,
): asserts networkId is AaveV3SupportedNetwork {
  if (!aaveV3SupportedNetworkList.includes(networkId)) {
    throw new Error(`Unsupported Aave V3 network id: ${networkId}`)
  }
}
