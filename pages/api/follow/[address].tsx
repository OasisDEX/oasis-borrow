import { get as getFollow } from 'handlers/follow/get'
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  switch (req.method) {
    case 'GET':
      return await getFollow(req, res)
    default:
      return res.status(405).end()
  }
}
export default handler
