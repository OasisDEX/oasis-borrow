import { configFetcherBackend } from 'handlers/config'
import { getProductHubData } from 'handlers/product-hub'
import { configCacheTime } from 'helpers/config'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async ({ method, query }, res) => {
  if (method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })

    return
  }

  const protocols = query.protocols
    ? Array.isArray(query.protocols)
      ? query.protocols
      : query.protocols.split(',')
    : []

  const [config, productHub] = await Promise.all([
    configFetcherBackend(),
    getProductHubData(protocols),
  ])

  res.setHeader('Cache-Control', `s-maxage=${configCacheTime.frontend}, stale-while-revalidate`)
  res.status(200).json({
    config,
    productHub,
  })
}

export default handler
