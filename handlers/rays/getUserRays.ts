import { getRaysDailyChallengeData } from 'handlers/dailyRays'
import { fetchFromFunctionsApi } from 'helpers/fetchFromFunctionsApi'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const querySchema = z.object({
  address: z.string(),
})

export async function getUserRays(req: NextApiRequest, res: NextApiResponse) {
  try {
    querySchema.parse(req.query)
  } catch (error) {
    return {
      errorMessage: 'Invalid GET parameters',
      error: String(error),
    }
  }

  const { address } = querySchema.parse(req.query)
  const dailyChallengeData = await prisma.raysDailyChallenge.findUnique({
    where: {
      address: address.toLocaleLowerCase(),
    },
  })
  const calculatedData = getRaysDailyChallengeData(dailyChallengeData?.claimed_dates)

  const response = await fetchFromFunctionsApi(`/api/rays?address=${address}`).then((resp) =>
    resp.json(),
  )

  return res.status(response.error ? 500 : 200).json({
    ...response,
    allPossiblePoints: response.allPossiblePoints + calculatedData.allBonusRays,
  })
}
