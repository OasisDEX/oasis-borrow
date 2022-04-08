import { User } from '@prisma/client'
import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const bodySchema = z.object({
  user_that_referred_address: z.string(),
  address: z.string(),
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const params = bodySchema.parse(req.body)

  if (params.user_that_referred_address !== params.address) {
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
  } else {
    return res.status(401).json('referral/cant selfrefer')
  }
}

export default withSentry(handler)
