import { get as getFollow } from 'handlers/follow/get'
import { apply } from 'helpers/apply'
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  switch (req.method) {
    case 'GET':
      return await getFollow(req, res)
    default:
      return res.status(405).end()
  }
}
export default apply(handler)
