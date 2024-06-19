import { fetchFromFunctionsApi } from 'helpers/fetchFromFunctionsApi'
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

  const response = await fetchFromFunctionsApi(`/api/rays/multipliers?address=${address}`).then(
    (resp) => resp.json(),
  )

  return res.status(response.error ? 500 : 200).json(response)
}
