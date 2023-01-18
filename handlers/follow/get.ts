import { selectVaultsFollowedByAddress } from 'handlers/follow/follow'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const paramsSchema = z.object({
  address: z.string(),
})

export async function get(req: NextApiRequest, res: NextApiResponse) {
  const { address } = paramsSchema.parse(req.query)
  const followedVaults = await selectVaultsFollowedByAddress(prisma, {
    address,
  })

  if (followedVaults === undefined || !followedVaults.length) {
    return res.status(404).json('Not found')
  } else {
    return res.status(200).json(followedVaults)
  }
}
