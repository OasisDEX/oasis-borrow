import { NextApiHandler } from 'next'
import { get } from 'server/middleware/tos/get'
import { sign } from 'server/middleware/tos/sign'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return await get(req, res)
    case 'POST':
      return await sign(req, res)
    default:
      return res.status(405).end()
  }
}
export default handler
