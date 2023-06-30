import NodeCache from 'node-cache'

interface Cached<T> {
  data: T
  time: number
}

export function cacheObject<R>(
  fetchFunction: () => Promise<R>,
  stdTTL: number, // seconds
  cacheId: string,
): () => Promise<Cached<R> | undefined> {
  const cache = new NodeCache({ stdTTL })
  const fallbackCache = new NodeCache({ stdTTL: 0 })

  function cacheFreshData(data: R) {
    const response = { data, time: Date.now() }
    cache.set('data', JSON.stringify(response))
    return JSON.stringify(response)
  }

  function cacheFallbackData(data: string) {
    fallbackCache.set('fallback', data)
  }

  return async (): Promise<Cached<R> | undefined> => {
    const hasStoredData = cache.has('data')

    if (hasStoredData) {
      return JSON.parse(cache.get('data') as string)
    }

    let data: Awaited<R> | undefined = undefined
    try {
      data = await fetchFunction()
    } catch (e) {
      console.error(`${cacheId}: Can't obtain fresh data. Using fallback data`, e)
    }
    if (data === undefined) {
      const hasFallback = fallbackCache.has('fallback')
      if (hasFallback) {
        return JSON.parse(fallbackCache.get('fallback') as string)
      } else {
        console.error(`${cacheId}: Can't obtain fallback data. Using empty data`)
        return undefined
      }
    } else {
      const cached = cacheFreshData(data)
      cacheFallbackData(cached)
      return JSON.parse(cached)
    }
  }
}
