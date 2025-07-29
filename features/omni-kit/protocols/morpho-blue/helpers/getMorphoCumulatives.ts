import type { GetCumulativesData, MorphoCumulativesData } from '@oasisdex/dma-library'
import { defaultLendingCumulatives } from 'features/omni-kit/constants'
import { mapOmniLendingCumulatives } from 'features/omni-kit/helpers'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

interface CacheEntry {
  data: MorphoCumulativesData
  timestamp: number
}

const cache: Record<string, CacheEntry> = {}
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

const createCacheKey = (
  networkId: OmniSupportedNetworkIds,
  proxy: string,
  marketId: string,
): string => {
  return `${networkId}-${proxy.toLowerCase()}-${marketId.toLowerCase()}`
}

const cleanupExpiredEntries = () => {
  const now = Date.now()
  Object.keys(cache).forEach((key) => {
    if (now - cache[key].timestamp > CACHE_DURATION_MS) {
      delete cache[key]
    }
  })
}

export const getMorphoCumulatives: (
  networkId: OmniSupportedNetworkIds,
) => GetCumulativesData<MorphoCumulativesData> =
  (networkId) => async (proxy: string, marketId: string) => {
    const cacheKey = createCacheKey(networkId, proxy, marketId)
    const now = Date.now()

    // cleanup expired entries before checking cache
    cleanupExpiredEntries()

    // check cache first
    const cachedEntry = cache[cacheKey]
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION_MS) {
      return cachedEntry.data
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

    // store in cache
    cache[cacheKey] = {
      data: result,
      timestamp: now,
    }

    return result
  }
