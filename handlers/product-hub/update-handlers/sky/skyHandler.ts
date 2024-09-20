import { skyUsdsStakeDetails } from 'blockchain/better-calls/sky'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, networksById } from 'blockchain/networks'
import type { ProductHubItem, ProductHubSupportedNetworks } from 'features/productHub/types'
import type {
  ProductHubHandlerResponse,
  ProductHubHandlerResponseData,
} from 'handlers/product-hub/types'
import { skyProductHubProducts } from 'handlers/product-hub/update-handlers/sky/skyProducts'

async function getSkyData(networkId: NetworkIds.MAINNET): ProductHubHandlerResponse {
  return Promise.all([skyUsdsStakeDetails()]).then(([srrData]) => {
    return {
      table: skyProductHubProducts
        .map((product) => {
          const { secondaryToken, primaryToken, label } = product
          const tokensAddresses = getNetworkContracts(networkId).tokens
          const primaryTokenAddress = tokensAddresses[primaryToken].address
          const secondaryTokenAddress = tokensAddresses[secondaryToken].address

          if (label === 'SRR') {
            return {
              ...product,
              primaryTokenAddress,
              secondaryTokenAddress,
              network: networksById[networkId].name as ProductHubSupportedNetworks,
              hasRewards: true,
              fee: srrData.rewardRate.toString(),
              liquidity: srrData.totalUSDSLocked.toString(),
            }
          }
          return {}
        })
        .filter(Boolean) as ProductHubItem[],
      warnings: [],
    }
  })
}

export default async function (): ProductHubHandlerResponse {
  return Promise.all([getSkyData(NetworkIds.MAINNET)]).then((responses) => {
    return responses.reduce<ProductHubHandlerResponseData>(
      (v, response) => {
        return {
          table: [...v.table, ...response.table],
          warnings: [...v.warnings, ...response.warnings],
        }
      },
      { table: [], warnings: [] },
    )
  })
}
