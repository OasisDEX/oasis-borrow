import { follow } from 'handlers/follow/follow'
import { apply } from 'helpers/apply'
import { userJwt } from 'helpers/useJwt'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  console.log('POST follow')
  console.log('req.method')
  console.log(req.method)
  console.log('req')
  console.log(req)
  switch (req.method) {
    case 'POST':
      console.log('POST follow')
      console.log(req)
      return await follow(req, res)
    default:
      return res.status(405).end()
  }
}
export default apply(userJwt, handler)
