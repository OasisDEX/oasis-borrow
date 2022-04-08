import { User } from '@prisma/client'
import express from 'express'
// import { userInfo } from 'os'
// @ts-ignore
import { prisma } from 'server/prisma'
import * as z from 'zod'

const paramsSchema = z.object({
  user_that_referred_address: z.string(),
  address: z.string(),
})

export async function createUser(req: express.Request, res: express.Response) {
  console.log(req.body)
  const params = paramsSchema.parse(req.body)

  // TODO check
  const user: User = {
    address: params.address,
    user_that_referred_address: params.user_that_referred_address,
    proxy_address: null,
    total_amount: '0',
    createdAt: new Date(),
  }
  console.log(user)
  try {
    const result = await prisma.user.create({ data: user })

    return res.status(200).json(result)
  } catch (error) {
    return res.status(401).json('NOK')
  }
}
