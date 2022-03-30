import { sign } from 'handlers/tos/sign'
import { apply } from 'helpers/apply'
import { NextApiHandler } from 'next'
import { userJwt } from 'server/jwt'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return await sign(req, res)
    default:
      return res.status(405).end()
  }
}
export default apply(userJwt, handler)
