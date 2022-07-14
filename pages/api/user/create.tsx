import { User } from '@prisma/client'
import { getAddress } from 'ethers/lib/utils'
import { getUserFromRequest } from 'handlers/signature-auth/getUserFromRequest'
import { apply } from 'helpers/apply'
import { userJwt } from 'helpers/useJwt'
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const bodySchema = z.object({
  user_that_referred_address: z.string().nullable(),
  address: z.string(),
  accepted: z.boolean(),
})

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return create(req, res)
    default:
      return res.status(405).end()
  }
}

const create = async (req: NextApiRequest, res: NextApiResponse) => {
  const params = bodySchema.parse(req.body)
  const checksumAddress = getAddress(params.address.toLocaleLowerCase())
  // get checksummed address of the referrer or null if user was not referred
  const checksumReferredAddress = params.user_that_referred_address
    ? getAddress(params.user_that_referred_address.toLocaleLowerCase())
    : null
  const user = getUserFromRequest(req)

  if (params.address.toLocaleLowerCase() !== user.address) {
    return res.status(401).json('referral-create/not-authorized')
  }
  if (params.user_that_referred_address && !checksumAddress) {
    return res.status(401).json('referral-create/invalid-address')
  }
  if (params.user_that_referred_address !== params.address) {
    // address is unique, hence it will revert on adding a duplicate
    const userCreate: User = {
      address: checksumAddress,
      user_that_referred_address: checksumReferredAddress,
      total_amount: '0',
      createdAt: new Date(),
      accepted: params.accepted,
    }
    // @ts-ignore
    // user_that_referred_address is here because the user can resign from being referred and it can be updated to `null`
    const userUpdate: User = {
      address: checksumAddress,
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
      return res.status(401).json(error)
    }
  } else {
    return res.status(401).json('referral-create/cant-selfrefer')
  }
}

export default apply(userJwt, handler)
