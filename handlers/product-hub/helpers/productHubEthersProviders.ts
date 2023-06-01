import { BaseNetworkNames, getNetworkRpcEndpoint, NetworkIds } from 'blockchain/networks'
import { ethers } from 'ethers'
import { ProductHubSupportedNetworks } from 'features/productHub/types'

export const productHubEthersProviders: Record<
  ProductHubSupportedNetworks,
  ethers.providers.JsonRpcProvider
> = {
  [BaseNetworkNames.Ethereum]: new ethers.providers.JsonRpcProvider(
    getNetworkRpcEndpoint(NetworkIds.MAINNET, NetworkIds.MAINNET),
  ),
  [BaseNetworkNames.Arbitrum]: new ethers.providers.JsonRpcProvider(
    getNetworkRpcEndpoint(NetworkIds.ARBITRUMMAINNET, NetworkIds.ARBITRUMMAINNET),
  ),
  [BaseNetworkNames.Optimism]: new ethers.providers.JsonRpcProvider(
    getNetworkRpcEndpoint(NetworkIds.OPTIMISMMAINNET, NetworkIds.OPTIMISMMAINNET),
  ),
}
