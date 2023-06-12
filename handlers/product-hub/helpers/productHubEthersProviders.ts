import { getRpcProvider, NetworkIds, NetworkNames } from 'blockchain/networks'
import { ethers } from 'ethers'
import { ProductHubSupportedNetworks } from 'features/productHub/types'

export const productHubEthersProviders: Record<
  ProductHubSupportedNetworks,
  () => ethers.providers.Provider
> = {
  [NetworkNames.ethereumMainnet]: () => getRpcProvider(NetworkIds.MAINNET),
  [NetworkNames.arbitrumMainnet]: () => getRpcProvider(NetworkIds.ARBITRUMMAINNET),
  [NetworkNames.optimismMainnet]: () => getRpcProvider(NetworkIds.OPTIMISMMAINNET),
}
