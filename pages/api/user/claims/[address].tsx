import { WeeklyClaim } from '@prisma/client'
import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'

type paramsSchema = {
  address: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end()
  const { address } = req.query as paramsSchema

  const claims = await selectClaimsByAddress(address)

  if (claims === undefined || claims == null) {
    return res.status(404).json({ error: 'NOK' })
  } else {
    return res.status(200).json(claims)
  }
}
export async function selectClaimsByAddress(address: string): Promise<WeeklyClaim[] | null> {
  return prisma.weeklyClaim.findMany({
    where: { user_address: address },
  })
}

export default withSentry(handler)
