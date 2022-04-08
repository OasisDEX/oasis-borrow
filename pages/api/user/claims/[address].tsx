import { WeeklyClaim } from '@prisma/client'
import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
// import { userInfo } from 'os'
// @ts-ignore
import { prisma } from 'server/prisma'

type paramsSchema = {
  address: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { address } = req.query as paramsSchema

  const claims = await selectClaimsByAddress(address)

  if (claims === undefined || claims == null) {
    return res.status(404).json({ error: 'NOK' })
  } else {
    return res.status(200).json(claims)
  }
}
export async function selectClaimsByAddress(address: string): Promise<WeeklyClaim[] | null> {
  const result = await prisma.weeklyClaim.findMany({
    where: { userAddress: address, claimed: false },
  })
  return result
}

export default withSentry(handler)
