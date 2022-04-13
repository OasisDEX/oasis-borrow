import { get } from 'handlers/tos/get'
import { apply } from 'helpers/apply'
import { userJwt } from 'helpers/useJwt'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return await get(req, res)
    default:
      return res.status(405).end()
  }
}
export default apply(userJwt, handler)
