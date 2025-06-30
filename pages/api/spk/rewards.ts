import { get } from 'handlers/spk/rewards-handler'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return get(req, res)
    default:
      return res.status(405).end()
  }
}

export default handler
