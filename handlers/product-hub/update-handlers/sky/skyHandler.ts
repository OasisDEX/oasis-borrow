import { skyUsdsStakeCleDetails, skyUsdsStakeDetails } from 'blockchain/better-calls/sky'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, networksById } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import type { ProductHubItem, ProductHubSupportedNetworks } from 'features/productHub/types'
import type {
  ProductHubHandlerResponse,
  ProductHubHandlerResponseData,
} from 'handlers/product-hub/types'
import { skyProductHubProducts } from 'handlers/product-hub/update-handlers/sky/skyProducts'

async function getSkyData(
  networkId: NetworkIds.MAINNET,
  tickers: Tickers,
): ProductHubHandlerResponse {
  return Promise.all([
    skyUsdsStakeDetails({ mkrPrice: tickers['mkr-usd'] || tickers['mkr-maker'] }),
    skyUsdsStakeCleDetails(),
  ]).then(([srrData, cleData]) => {
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
              weeklyNetApy: srrData.apy.toFixed(2),
              liquidity: srrData.totalUSDSLocked.toString(),
            }
          }
          if (label === 'CLE') {
            return {
              ...product,
              primaryTokenAddress,
              secondaryTokenAddress,
              network: networksById[networkId].name as ProductHubSupportedNetworks,
              hasRewards: true,
              liquidity: cleData.totalUSDSLocked.toString(),
            }
          }
          return {}
        })
        .filter(Boolean) as ProductHubItem[],
      warnings: [],
    }
  })
}

export default async function (tickers: Tickers): ProductHubHandlerResponse {
  return Promise.all([getSkyData(NetworkIds.MAINNET, tickers)]).then((responses) => {
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
