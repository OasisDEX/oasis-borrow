import { cacheObject } from 'helpers/api/cacheObject'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getOasisStats } from 'server/services/getOasisStats'

const getStats = cacheObject(getOasisStats, 12 * 60 * 60, 'oasis-stats')

async function oasisStatsHandler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const stats = await getStats()
      if (stats?.data) {
        return res.status(200).json(stats.data)
      } else {
        return res.status(404).json({ error: 'Summer.fi stats unavailable' })
      }
    default:
      return res.status(405).end()
  }
}

export default oasisStatsHandler
