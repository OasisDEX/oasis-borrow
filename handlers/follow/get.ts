import { selectVaultsFollowedByAddress } from 'handlers/follow/follow'
import { add } from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const paramsSchema = z.object({
  address: z.string()
})

export async function get(req: NextApiRequest, res: NextApiResponse) {
    console.log('paramsSchema.parse(req.query)')
    console.log(paramsSchema.parse(req.query))
  const { address } = paramsSchema.parse(req.query)
  console.log('address',address)
  const followedVaults = await selectVaultsFollowedByAddress(prisma, {
    address,
  })
  console.log('followedVaults', followedVaults)

  if (followedVaults === undefined || !followedVaults.length) {
    console.log(404)
    return res.status(404).send('Not Found')
  } else {
    console.log(200)
    console.log('...followedVaults')
    console.log(...followedVaults)
    return res.status(200).json({
      ...followedVaults,
    })
  }
}
