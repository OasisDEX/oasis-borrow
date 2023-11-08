import { portfolioPositionsHandler } from 'handlers/portfolio/positions'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  const { query, method } = req
  if (method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!query.address) {
    res.status(400).json({ error: 'Missing address' })
    return
  }
  const { positions } = await portfolioPositionsHandler(req)
  res.status(200).json({ positions })
}
export default handler
