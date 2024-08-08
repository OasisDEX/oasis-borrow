import { getRisk } from 'handlers/risk/get'
import { withPreflightHandler } from 'helpers/api/withPreflightHandler'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      if (process.env.NODE_ENV === 'development') {
        // nobodys risky when you develop stuff :)
        return res.status(200).json({ isRisky: false })
      }
      return await getRisk(req, res)
    default:
      return res.status(405).end()
  }
}

export default withPreflightHandler(handler)
