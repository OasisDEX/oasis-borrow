import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

import { cacheObject } from '../../helpers/cacheObject'
import { getOasisStats } from '../../server/services/getOasisStats'

const getStats = cacheObject(getOasisStats, 12 * 60 * 60)

async function oasisStatsHandler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const stats = await getStats()
      if (stats.data) {
        return res.status(200).json(stats.data)
      } else {
        return res.status(404).json({ error: 'Oasis stats unavailable' })
      }
    default:
      return res.status(405).end()
  }
}

export default withSentry(oasisStatsHandler)
