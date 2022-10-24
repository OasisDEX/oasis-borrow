import { withSentry } from '@sentry/nextjs'
import { getDiscoverData } from 'handlers/discover/discover'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return await getDiscoverData(req, res)
    default:
      return res.status(405).end()
  }
}
export default withSentry(handler)
