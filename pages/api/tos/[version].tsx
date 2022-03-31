import { get } from 'handlers/tos/get'
import { NextApiHandler } from 'next'
import { withJwt } from 'server/jwt'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return await get(req, res)
    default:
      return res.status(405).end()
  }
}
export default withJwt(handler)
