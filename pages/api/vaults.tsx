import { getMultipleVaults } from 'handlers/getMultipleVaults'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return await getMultipleVaults(req, res)
    default:
      return res.status(405).end()
  }
}
export default handler
