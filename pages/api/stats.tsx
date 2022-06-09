import { NextApiRequest, NextApiResponse } from 'next'
import { getOasisStats } from '../../server/snowflake'
import { cacheObject } from '../../helpers/cacheObject'

const getStats = cacheObject(getOasisStats, 12 * 60 * 60)

export default async function oasisStatsHandler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const stats = await getStats()
      if (stats) {
        res.status(200).json(stats)
      } else {
        res.status(404).json({ error: 'Oasis stats unavailable' })
      }
    default:
      return res.status(405).end()
  }
}
