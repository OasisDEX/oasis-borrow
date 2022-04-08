import { WeeklyClaim } from '@prisma/client'
import express from 'express'
// import { userInfo } from 'os'
// @ts-ignore
import { prisma } from 'server/prisma'
import * as z from 'zod'

const paramsSchema = z.object({
  address: z.string(),
})

export async function getClaims(req: express.Request, res: express.Response) {
  const params = paramsSchema.parse(req.params)

  const claims = await selectClaimsByAddress({
    address: params.address,
  })

  if (claims === undefined || claims == null) {
    return res.sendStatus(404)
  } else {
    return res.status(200).json(claims)
  }
}
export async function selectClaimsByAddress({
  address,
}: {
  address: string
}): Promise<WeeklyClaim[] | null> {
  const result = await prisma.weeklyClaim.findMany({
    where: { userAddress: address, claimed: false },
  })
  return result
}
