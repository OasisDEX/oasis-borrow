import type { GetCumulativesData, MorphoCumulativesData } from '@oasisdex/dma-library'
import { defaultLendingCumulatives } from 'features/omni-kit/constants'
import { mapOmniLendingCumulatives } from 'features/omni-kit/helpers'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import NodeCache from 'node-cache'

// Cache with 5 minute TTL (300 seconds)
const cache = new NodeCache({ stdTTL: 300 })

const createCacheKey = (
  networkId: OmniSupportedNetworkIds,
  proxy: string,
  marketId: string,
): string => {
  return `${networkId}-${proxy.toLowerCase()}-${marketId.toLowerCase()}`
}

export const getMorphoCumulatives: (
  networkId: OmniSupportedNetworkIds,
) => GetCumulativesData<MorphoCumulativesData> =
  (networkId) => async (proxy: string, marketId: string) => {
    const cacheKey = createCacheKey(networkId, proxy, marketId)

    // Check cache first
    const cachedResult = cache.get<MorphoCumulativesData>(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    // Fetch fresh data
    const { response } = (await loadSubgraph({
      subgraph: 'Morpho',
      method: 'getMorphoCumulatives',
      networkId,
      params: {
        dpmProxyAddress: proxy.toLowerCase(),
        marketId: marketId.toLowerCase(),
      },
    })) as SubgraphsResponses['Morpho']['getMorphoCumulatives']

    const lendingCumulatives = response.account?.borrowPositions[0]

    let result: MorphoCumulativesData
    if (!lendingCumulatives) {
      result = defaultLendingCumulatives
    } else {
      result = {
        ...mapOmniLendingCumulatives(lendingCumulatives),
      }
    }

    // Store in cache with automatic expiration
    cache.set(cacheKey, result)

    return result
  }
