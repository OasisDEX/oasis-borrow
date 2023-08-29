import { NetworkIds } from 'blockchain/networks'

export type AaveV3SupportedNetwork =
  | NetworkIds.MAINNET
  | NetworkIds.OPTIMISMMAINNET
  | NetworkIds.ARBITRUMMAINNET

export function ensureIsSupportedAaveV3NetworkId(
  networkId: number,
): asserts networkId is AaveV3SupportedNetwork {
  if (
    ![NetworkIds.MAINNET, NetworkIds.OPTIMISMMAINNET, NetworkIds.ARBITRUMMAINNET].includes(
      networkId,
    )
  ) {
    throw new Error(`Unsupported Aave V3 network id: ${networkId}`)
  }
}
