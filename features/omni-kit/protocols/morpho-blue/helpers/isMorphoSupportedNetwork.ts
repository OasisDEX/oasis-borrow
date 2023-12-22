import { NetworkIds } from 'blockchain/networks'
import type { MorphoSupportedNetworksIds } from 'features/omni-kit/protocols/morpho-blue/types'

export const isMorphoSupportedNetwork = (
  networkId: NetworkIds,
): networkId is MorphoSupportedNetworksIds =>
  networkId === NetworkIds.MAINNET || networkId === NetworkIds.GOERLI
