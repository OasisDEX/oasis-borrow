import { getNetworkRpcEndpoint, NetworkIds, NetworkNames } from 'blockchain/networks'
import { ethers } from 'ethers'
import { ProductHubSupportedNetworks } from 'features/productHub/types'

export const productHubEthersProviders: Record<
  ProductHubSupportedNetworks,
  ethers.providers.JsonRpcProvider
> = {
  [NetworkNames.ethereumMainnet]: new ethers.providers.JsonRpcProvider(
    getNetworkRpcEndpoint(NetworkIds.MAINNET, NetworkIds.MAINNET),
  ),
  [NetworkNames.arbitrumMainnet]: new ethers.providers.JsonRpcProvider(
    getNetworkRpcEndpoint(NetworkIds.ARBITRUMMAINNET, NetworkIds.ARBITRUMMAINNET),
  ),
  [NetworkNames.optimismMainnet]: new ethers.providers.JsonRpcProvider(
    getNetworkRpcEndpoint(NetworkIds.OPTIMISMMAINNET, NetworkIds.OPTIMISMMAINNET),
  ),
}
