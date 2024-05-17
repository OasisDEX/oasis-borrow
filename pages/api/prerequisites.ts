import { fetchContentfulGraphQL } from 'contentful/api'
import { configFetcherBackend } from 'handlers/config'
import { parseNavigationResponse } from 'handlers/navigation/helpers'
import { navigationQuery } from 'handlers/navigation/query'
import type { NavigationResponse } from 'handlers/navigation/types'
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

  const [config, productHub, navigationResponse] = await Promise.all([
    configFetcherBackend(),
    getProductHubData(protocols),
    fetchContentfulGraphQL<NavigationResponse>(navigationQuery),
  ])

  const navigation = parseNavigationResponse({ navigationResponse, productHub })

  res.setHeader('Cache-Control', `s-maxage=${configCacheTime.frontend}, stale-while-revalidate`)
  res.status(200).json({
    navigation,
    config,
    productHub,
  })
}

export default handler
