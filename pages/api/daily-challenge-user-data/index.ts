import { dailyRaysGetHandler } from 'handlers/rays/dailyRays'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  // had to separate these because jwt doesnt handle GET requests
  switch (req.method) {
    case 'GET':
      return dailyRaysGetHandler(req, res)
    default:
      return res.status(405).json({ error: 'Method Not Allowed' })
  }
}

export default handler
