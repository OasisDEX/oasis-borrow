import { DiscoverApiErrors } from 'features/discover/types'
import { getDiscoveryData } from 'handlers/discover/getDiscoveryData'
import type { NextApiRequest, NextApiResponse } from 'next'

export async function get(req: NextApiRequest, res: NextApiResponse) {
  const response = await getDiscoveryData(req.query)

  return response.error
    ? res.status(500).json(response)
    : response.rows.length
    ? res.status(200).json(response)
    : res.status(200).json({
        error: { code: DiscoverApiErrors.NO_ENTRIES, reason: 'discover/no-data-found' },
      })
}
