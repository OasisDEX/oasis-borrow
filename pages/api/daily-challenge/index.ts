import { dailyRaysGetHandler, dailyRaysPostHandler } from 'handlers/rays/dailyRays'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return dailyRaysGetHandler(req, res)
    case 'POST':
      return dailyRaysPostHandler(req, res)
    default:
      return res.status(405).json({ error: 'Method Not Allowed' })
  }
}

export default handler
