import NodeCache from 'node-cache'

interface Cached<T> {
  data: T
  time: number
}
export function cacheObject<R>(
  fetchFunction: () => Promise<R>,
  stdTTL: number, // seconds
): () => Promise<Cached<R>> {
  const statsCache = new NodeCache({ stdTTL })

  async function cacheFreshData() {
    const response = { data: await fetchFunction(), time: Date.now() }
    statsCache.set('data', JSON.stringify(response))
    return JSON.stringify(response)
  }

  statsCache.on('expired', async () => {
    return cacheFreshData()
  })

  return async () => {
    let storedData: string | undefined = statsCache.get('data')

    if (!storedData) {
      storedData = await cacheFreshData()
    }

    return storedData ? JSON.parse(storedData) : undefined
  }
}
