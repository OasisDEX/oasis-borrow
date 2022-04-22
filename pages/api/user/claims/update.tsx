import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const bodySchema = z.object({
  week_number: z.array(z.number()),
  user_address: z.string(),
})
// TODO add jwt check
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { week_number, user_address } = bodySchema.parse(req.body)

  try {
    const result = await prisma.weeklyClaim.updateMany({
      where: {
        user_address: user_address,
        week_number: { in: week_number },
      },
      data: { claimed: true },
    })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(401).json('weekly-claim/failed-update')
  }
}

export default withSentry(handler)
