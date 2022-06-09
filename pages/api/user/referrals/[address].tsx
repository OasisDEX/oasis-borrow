import { User } from '@prisma/client'
import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'

type paramsSchema = {
  address: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end()
  const { address } = req.query as paramsSchema

  const referredUsers = await selectUsersByReferredAddress(address)

  if (referredUsers === undefined || referredUsers == null) {
    return res.status(404).json({ error: 'NOK' })
  } else {
    return res.status(200).json(referredUsers)
  }
}
export async function selectUsersByReferredAddress(address: string): Promise<User[] | null> {
  return prisma.user.findMany({
    where: { user_that_referred_address: address },
  })
}

export default withSentry(handler)
