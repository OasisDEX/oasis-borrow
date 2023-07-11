import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return res.status(200).json({ test: 'test' })
    default:
      return res.status(405).end()
  }
}
export default handler
