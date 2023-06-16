import { Network } from '@oasisdex/dma-library'
import { getTokenAddresses } from 'actions/aave/get-token-addresses'
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
  { swapAddress }: ReturnType<typeof getTokenAddresses>,
  network: NetworkIds,
) {
  const oneInchVersion = [NetworkIds.OPTIMISMMAINNET, NetworkIds.ARBITRUMMAINNET].includes(network)
    ? 'v5.0'
    : 'v4.0'
  return getOneInchCall(swapAddress, network, oneInchVersion)
}
