import { FeatureTogglesApiErrors } from 'features/discover/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'

export async function getFeatureToggles() {
  return await prisma.feature_flags.findFirst()
}

export async function get(req: NextApiRequest, res: NextApiResponse) {
  const response = await getFeatureToggles()

  return !response
    ? res.status(500).json({
        error: {
          code: FeatureTogglesApiErrors.NO_ENTRIES,
          reason: 'feature_toggles/no-data-found',
        },
      })
    : res.status(200).json({ ...response })
}
