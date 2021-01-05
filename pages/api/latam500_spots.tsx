import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'

const LATAM500_USERS_LIMIT = 500

export default async function latam500Spots(req: NextApiRequest, res: NextApiResponse) {
  const count = await prisma.raw<any>('SELECT count(recipient) FROM latam500_distribution')
  const existingUsersCount = count[0].count
  const spotsLeft = LATAM500_USERS_LIMIT - existingUsersCount

  res.status(201).json({ spots_left: spotsLeft })
}
