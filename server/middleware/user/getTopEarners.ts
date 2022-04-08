import { User } from '@prisma/client'
import express from 'express'
// import { userInfo } from 'os'
// @ts-ignore
import { prisma } from 'server/prisma'

export async function getTopEarners(req: express.Request, res: express.Response) {
  const topEarners = await selectUsersByTotalEarnings()

  if (topEarners === undefined || topEarners == null) {
    return res.sendStatus(404)
  } else {
    return res.status(200).json(topEarners)
  }
}
export async function selectUsersByTotalEarnings(): Promise<User[] | null> {
  const result = await prisma.user.findMany({
    take: 10,
    orderBy: [
      {
        total_amount: 'desc',
      },
    ],
  })
  return result
}
