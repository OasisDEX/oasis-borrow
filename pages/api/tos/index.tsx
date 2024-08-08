import { sign } from 'handlers/tos/sign'
import { withPreflightHandler } from 'helpers/api/withPreflightHandler'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return await sign(req, res)
    default:
      return res.status(405).end()
  }
}

export default withPreflightHandler(handler)
