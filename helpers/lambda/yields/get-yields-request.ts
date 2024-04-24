import { getYieldsConfig } from './get-yields-config'
import type { GetYieldsParams, GetYieldsResponse } from './get-yields-types'

const cache: Record<string, GetYieldsResponse | null> = {}

export const getYieldsRequest = async (
  params: GetYieldsParams,
  urlPrefix?: string,
): Promise<GetYieldsResponse | null> => {
  const { url } = getYieldsConfig(params)
  // Use params.ltv as the cache key
  const cacheKey = `${params.ltv.toFixed(4).toString()}-${params.collateralToken}-${params.quoteToken}-${params.networkId}`

  // If the response is in the cache, return it
  if (cacheKey in cache) {
    return cache[cacheKey]
  }
  try {
    const response = await fetch(`${urlPrefix ?? ''}${url}`, {
      method: 'GET',
    })
    const data = (await response.json()) as GetYieldsResponse
    // Store the response in the cache
    cache[cacheKey] = data
    return data
  } catch (e) {
    console.error('Failed to read data about yields from server', e)
    return null
  }
}
