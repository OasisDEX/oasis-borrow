import { follow, unfollow } from 'handlers/follow/follow'
import { apply } from 'helpers/apply'
import { userJwt } from 'helpers/useJwt'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return await follow(req, res)
    case 'DELETE':
      return await unfollow(req, res)
    default:
      return res.status(405).end()
  }
}
export default apply(userJwt, handler)
