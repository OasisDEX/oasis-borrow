import { configFetcherBackend } from 'handlers/config'
import { configCacheTime } from 'helpers/config'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { method } = req
  if (method === 'GET') {
    const config = await configFetcherBackend()
    res.setHeader('Cache-Control', `s-maxage=${configCacheTime.frontend}, stale-while-revalidate`)
    return res.status(200).json(config ?? { error: 'No config found' })
  } else {
    res.status(405).send({ message: 'Only GET requests allowed' })
  }
  return res.status(403).json({ message: 'Not allowed.' })
}
