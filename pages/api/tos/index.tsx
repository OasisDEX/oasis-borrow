import { sign } from 'handlers/tos/sign'
import { NextApiHandler } from 'next'
import { withJwt } from 'server/jwt'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return await sign(req, res)
    default:
      return res.status(405).end()
  }
}
export default withJwt(handler)
