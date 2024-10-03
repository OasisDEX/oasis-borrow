import { getCleRewards } from 'handlers/sky/get'
import { withPreflightHandler } from 'helpers/api/withPreflightHandler'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return await getCleRewards(req, res)
    default:
      return res.status(405).end()
  }
}

export default withPreflightHandler(handler)
