import { getRaysMultipliers } from 'handlers/rays/getRaysMultipliers'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return await getRaysMultipliers(req, res)
    default:
      return res.status(405).end()
  }
}
export default handler
