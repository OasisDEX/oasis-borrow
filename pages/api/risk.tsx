import { getRisk } from 'handlers/risk/get'
import { apply } from 'helpers/apply'
import type { NextApiHandler } from 'next'
import { userJwt } from 'server/jwt'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return await getRisk(req, res)
    default:
      return res.status(405).end()
  }
}

export default apply(userJwt, handler)
