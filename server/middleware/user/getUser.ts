import { User } from '@prisma/client'
import express from 'express'
// import { userInfo } from 'os'
// @ts-ignore
import { prisma } from 'server/prisma'
import * as z from 'zod'

const paramsSchema = z.object({
  address: z.string(),
})

export async function getUser(req: express.Request, res: express.Response) {
  const params = paramsSchema.parse(req.params)

  const user = await selectUserByAddress({
    address: params.address,
  })

  if (user === undefined || user == null) {
    return res.sendStatus(404)
  } else {
    return res.status(200).json(user)
  }
}
export async function selectUserByAddress({
  address,
}: {
  address: string
}): Promise<User | null> {
  const result = await prisma.user.findUnique({
    where: { address: address },
  })
  return result
}
