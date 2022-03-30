import { getRisk } from 'handlers/risk/get'
import { apply } from 'helpers/apply'
import { NextApiHandler } from 'next'
import { userJwt } from 'server/jwt'

// eslint-disable-next-line func-style
const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return await getRisk(req, res)
    default:
      return res.status(405).end()
  }
}

export default apply(userJwt, handler)
