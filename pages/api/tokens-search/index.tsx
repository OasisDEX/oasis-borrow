import { get } from 'handlers/tokens-search/get'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return get(req, res)
    default:
      return res.status(405).end()
  }
}

export default handler
