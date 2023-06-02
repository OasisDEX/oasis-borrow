import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { ProductHubSupportedNetworks } from 'features/productHub/types'
import { GraphQLClient } from 'graphql-request'

export const graphQlProviders: Record<ProductHubSupportedNetworks, GraphQLClient> = {
  [NetworkNames.ethereumMainnet]: new GraphQLClient(
    getNetworkContracts(NetworkIds.MAINNET, NetworkIds.MAINNET).cacheApi,
  ),
  [NetworkNames.arbitrumMainnet]: new GraphQLClient(
    getNetworkContracts(NetworkIds.ARBITRUMMAINNET, NetworkIds.ARBITRUMMAINNET).cacheApi,
  ),
  [NetworkNames.optimismMainnet]: new GraphQLClient(
    getNetworkContracts(NetworkIds.OPTIMISMMAINNET, NetworkIds.OPTIMISMMAINNET).cacheApi,
  ),
}
