import { configFetcherBackend } from 'handlers/config'
import { configCacheTime } from 'helpers/config'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async ({ method }, res) => {
  if (method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })

    return
  }

  const [config] = await Promise.all([configFetcherBackend()])

  res.setHeader('Cache-Control', `s-maxage=${configCacheTime.frontend}, stale-while-revalidate`)
  res.status(200).json({
    config,
  })
}

export default handler
