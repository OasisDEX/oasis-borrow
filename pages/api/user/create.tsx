import { User } from '@prisma/client'
import { withSentry } from '@sentry/nextjs'
import { getAddress } from 'ethers/lib/utils'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const bodySchema = z.object({
  user_that_referred_address: z.string(),
  address: z.string(),
})
// TODO add jwt check
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const params = bodySchema.parse(req.body)
  const checksumAddress = getAddress(params.address.toLocaleLowerCase())

  if (!checksumAddress) {
    return res.status(401).json('referral-create/invalid-address')
  }

  if (params.user_that_referred_address !== params.address) {
    // address is unique, hence it will revert on adding a duplicate
    const user: User = {
      address: params.address,
      user_that_referred_address: params.user_that_referred_address,
      proxy_address: null,
      total_amount: '0',
      createdAt: new Date(),
    }
    try {
      const result = await prisma.user.create({ data: user })
      return res.status(200).json(result)
    } catch (error) {
      return res.status(401).json('referral-create/create-error')
    }
  } else {
    return res.status(401).json('referral-create/cant-selfrefer')
  }
}

export default withSentry(handler)
