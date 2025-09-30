import { raysUserMultipliersMockedResponse } from 'handlers/portfolio/positions/helpers/rays-mock'
import type { NextApiRequest, NextApiResponse } from 'next'
import * as z from 'zod'

const querySchema = z.object({
  address: z.string(),
})

export async function getRaysMultipliers(req: NextApiRequest, res: NextApiResponse) {
  try {
    querySchema.parse(req.query)
  } catch (error) {
    return {
      errorMessage: 'Invalid GET parameters',
      error: String(error),
    }
  }

  const { address } = querySchema.parse(req.query)

  return res.status(200).json(Promise.resolve(raysUserMultipliersMockedResponse(address)))
}
