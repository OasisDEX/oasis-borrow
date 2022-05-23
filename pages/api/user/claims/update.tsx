import { getUserFromRequest } from 'handlers/signature-auth/getUserFromRequest'
import { apply } from 'helpers/apply'
import { userJwt } from 'helpers/useJwt'
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const bodySchema = z.object({
  week_number: z.array(z.number()),
  user_address: z.string(),
})
const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return update(req, res)
    default:
      return res.status(405).end()
  }
}

const update = async (req: NextApiRequest, res: NextApiResponse) => {
  const { week_number, user_address } = bodySchema.parse(req.body)
  const user = getUserFromRequest(req)
  try {
    if (user_address.toLocaleLowerCase() === user.address) {
      const result = await prisma.weeklyClaim.updateMany({
        where: {
          user_address: user_address,
          week_number: { in: week_number },
        },
        data: { claimed: true },
      })
      return res.status(200).json(result)
    } else {
      return res.status(401).send('Unauthorized')
    }
  } catch (error) {
    return res.status(401).json('weekly-claim/failed-update')
  }
}

export default apply(userJwt, handler)
