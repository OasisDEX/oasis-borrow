import NodeCache from 'node-cache'

interface Cached<T> {
  data: T
  time: number
}

export function cacheObject<R>(
  fetchFunction: () => Promise<R>,
  stdTTL: number, // seconds
): () => Promise<Cached<R>> {
  const cache = new NodeCache({ stdTTL })

  async function cacheFreshData() {
    const response = { data: await fetchFunction(), time: Date.now() }
    cache.set('data', JSON.stringify(response))
    return JSON.stringify(response)
  }

  return async () => {
    let storedData: string | undefined = cache.get('data')

    if (!storedData) {
      storedData = await cacheFreshData()
    }

    return storedData ? JSON.parse(storedData) : undefined
  }
}
