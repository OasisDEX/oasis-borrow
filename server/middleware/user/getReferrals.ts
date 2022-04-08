import { User } from '@prisma/client'
import express from 'express'
// import { userInfo } from 'os'
// @ts-ignore
import { prisma } from 'server/prisma'
import * as z from 'zod'

const paramsSchema = z.object({
  address: z.string(),
})

export async function getReferrals(req: express.Request, res: express.Response) {
  const params = paramsSchema.parse(req.params)

  const referredUsers = await selectUsersByReferredAddress({
    address: params.address,
  })

  if (referredUsers === undefined || referredUsers == null) {
    return res.sendStatus(404)
  } else {
    return res.status(200).json(referredUsers)
  }
}
export async function selectUsersByReferredAddress({
  address,
}: {
  address: string
}): Promise<User[] | null> {
  const result = await prisma.user.findMany({
    where: { user_that_referred_address: address },
  })
  return result
}
