import { User } from '@prisma/client'
import { withSentry } from '@sentry/nextjs'
import { getAddress } from 'ethers/lib/utils'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const bodySchema = z.object({
  user_that_referred_address: z.string().nullable(),
  address: z.string(),
  accepted: z.boolean(),
})
// TODO add jwt check
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const params = bodySchema.parse(req.body)
  const checksumAddress = getAddress(params.address.toLocaleLowerCase())
  const checksumReferredAddress = params.user_that_referred_address
    ? getAddress(params.user_that_referred_address.toLocaleLowerCase())
    : null
  if (params.user_that_referred_address && !checksumAddress) {
    return res.status(401).json('referral-create/invalid-address')
  }

  if (params.user_that_referred_address !== params.address) {
    // address is unique, hence it will revert on adding a duplicate
    const userCreate: User = {
      address: params.address,
      user_that_referred_address: checksumReferredAddress,
      total_amount: '0',
      createdAt: new Date(),
      accepted: params.accepted,
    }
    // @ts-ignore
    const userUpdate: User = {
      address: params.address,
      user_that_referred_address: checksumReferredAddress,
      accepted: params.accepted,
    }
    try {
      const result = await prisma.user.upsert({
        where: { address: params.address },
        create: userCreate,
        update: userUpdate,
      })
      return res.status(200).json(result)
    } catch (error) {
      console.log(error)
      return res.status(401).json(error)
    }
  } else {
    return res.status(401).json('referral-create/cant-selfrefer')
  }
}

export default withSentry(handler)
