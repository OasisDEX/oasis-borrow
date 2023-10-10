import { getAjnaRewardsData } from 'handlers/ajna-rewards/getAjnaRewardsData'
import type { NextApiRequest, NextApiResponse } from 'next'

export async function get(req: NextApiRequest, res: NextApiResponse) {
  const response = await getAjnaRewardsData(req.query)

  return res.status(response.error ? 500 : 200).json(response)
}
