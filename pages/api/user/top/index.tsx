import { User } from '@prisma/client'
import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const topEarners = await selectUsersByTotalEarnings()

  if (topEarners === undefined || topEarners == null) {
    return res.status(401).json({ error: 'NOK' })
  } else {
    return res.status(200).json(topEarners)
  }
}
export async function selectUsersByTotalEarnings(): Promise<User[] | null> {
  return await prisma.user.findMany({
    take: 10,
    orderBy: [
      {
        total_amount: 'desc',
      },
    ],
  })
}

export default withSentry(handler)
