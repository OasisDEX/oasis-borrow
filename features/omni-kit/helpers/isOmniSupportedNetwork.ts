import { NetworkIds } from 'blockchain/networks'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'

export const isOmniSupportedNetwork = (
  networkId: NetworkIds,
): networkId is OmniSupportedNetworkIds =>
  networkId === NetworkIds.MAINNET ||
  networkId === NetworkIds.GOERLI ||
  networkId === NetworkIds.OPTIMISMMAINNET ||
  networkId === NetworkIds.ARBITRUMMAINNET ||
  networkId === NetworkIds.BASEMAINNET
