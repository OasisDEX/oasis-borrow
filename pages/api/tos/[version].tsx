import { get } from 'handlers/tos/get'
import { sign } from 'handlers/tos/sign'
import { NextApiHandler } from 'next'

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
