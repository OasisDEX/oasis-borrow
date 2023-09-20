import type { IPosition, Network, Tokens } from '@oasisdex/dma-library'
import type { getAddresses } from 'actions/aave-like/get-addresses'
import { NetworkIds } from 'blockchain/networks'
import { getOneInchCall } from 'helpers/swap'

// enum Network {
//   MAINNET = "mainnet",
//   GOERLI = "goerli",
//   HARDHAT = "hardhat",
//   OPTIMISM = "optimism",
//   ARBITRUM = "arbitrum",
//   LOCAL = "local"
// }

export function networkIdToLibraryNetwork(networkId: NetworkIds): Network {
  switch (networkId) {
    case NetworkIds.MAINNET:
      return 'mainnet' as Network
    case NetworkIds.GOERLI:
      return 'goerli' as Network
    case NetworkIds.OPTIMISMMAINNET:
      return 'optimism' as Network
    case NetworkIds.ARBITRUMMAINNET:
      return 'arbitrum' as Network
    default:
      throw new Error(`Can't convert networkId ${networkId} to library network`)
  }
}

export function swapCall(
  { swapAddress }: Pick<ReturnType<typeof getAddresses>, 'swapAddress'>,
  network: NetworkIds,
) {
  const oneInchVersion = [NetworkIds.OPTIMISMMAINNET, NetworkIds.ARBITRUMMAINNET].includes(network)
    ? 'v5.0'
    : 'v4.0'
  return getOneInchCall(swapAddress, network, oneInchVersion)
}

export const getCurrentPositionLibCallData = (currentPosition: IPosition) => [
  {
    symbol: currentPosition.collateral.symbol as Tokens,
    precision: currentPosition.collateral.precision,
  },
  {
    symbol: currentPosition.debt.symbol as Tokens,
    precision: currentPosition.debt.precision,
  },
]
