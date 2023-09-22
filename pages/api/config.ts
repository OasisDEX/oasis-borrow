import { configFetcherBackend } from 'handlers/config'
import { configCacheTime } from 'helpers/config'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const config = await configFetcherBackend()
  const { method } = req
  if (method === 'GET') {
    res.setHeader('Cache-Control', `s-maxage=${configCacheTime.frontend}, stale-while-revalidate`)
    return res.status(200).json(config ?? { error: 'No config found' })
  }
  return res.status(403).json({ message: 'Not allowed.' })
}
