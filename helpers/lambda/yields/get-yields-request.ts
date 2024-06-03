import { getYieldsConfig } from './get-yields-config'
import type { GetYieldsParams, GetYieldsResponse } from './get-yields-types'

interface CacheEntry {
  data: GetYieldsResponse | null
  timestamp: number
}

const cache: Record<string, CacheEntry> = {}
const CACHE_DURATION_MS = 5 * 60 * 1000

export const getYieldsRequest = async (
  params: GetYieldsParams,
  urlPrefix?: string,
): Promise<GetYieldsResponse | null> => {
  const { url } = getYieldsConfig(params)
  // Use params.ltv as the cache key
  const cacheKey = `${params.ltv.toFixed(4).toString()}-${params.collateralToken}-${params.quoteToken}-${params.networkId}`

  const cachedEntry = cache[cacheKey]
  const now = Date.now()

  if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION_MS) {
    return cachedEntry.data
  }
  try {
    const response = await fetch(`${urlPrefix ?? ''}${url}`, {
      method: 'GET',
    })
    const data = (await response.json()) as GetYieldsResponse
    // Store the response in the cache
    cache[cacheKey] = { data, timestamp: now }
    return data
  } catch (e) {
    console.error('Failed to read data about yields from server', e)
    return null
  }
}
