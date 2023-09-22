import type { User } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'

type paramsSchema = {
  address: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') return res.status(405).end()
  const { address } = req.query as paramsSchema

  const user = await selectUserByAddress(address)
  if (user === undefined) {
    return res.status(404).json({ error: 'NOK' })
  } else {
    return res.status(200).json(user)
  }
}
export async function selectUserByAddress(address: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { address: address },
  })
}

export default handler
