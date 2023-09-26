import { handleGetProductHubData, updateProductHubData } from 'handlers/product-hub'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'POST':
      return handleGetProductHubData(req, res)
    case 'PATCH':
      return updateProductHubData(req, res)
    default:
      return res.status(405).end()
  }
}
export default handler
