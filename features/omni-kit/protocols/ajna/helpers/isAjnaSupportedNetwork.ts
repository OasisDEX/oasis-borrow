import { NetworkIds } from 'blockchain/networks'
import type { AjnaSupportedNetworksIds } from 'features/omni-kit/protocols/ajna/types'

export const isAjnaSupportedNetwork = (
  networkId: NetworkIds,
): networkId is AjnaSupportedNetworksIds =>
  networkId === NetworkIds.MAINNET ||
  networkId === NetworkIds.GOERLI ||
  networkId === NetworkIds.BASEMAINNET
