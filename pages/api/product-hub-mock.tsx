import { mockProductHubData } from 'handlers/product-hub'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'POST':
      return mockProductHubData(req, res)
    default:
      return res.status(405).end()
  }
}
export default handler
