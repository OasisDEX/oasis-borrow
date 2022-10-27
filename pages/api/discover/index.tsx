import { withSentry } from '@sentry/nextjs'
import { get } from 'handlers/discover/get'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return await get(req, res)
    default:
      return res.status(405).end()
  }
}
export default withSentry(handler)
