import {
  handleGetProductHubData,
  mockProductHubData,
  updateProductHubData,
} from 'handlers/product-hub'
import { NextApiHandler } from 'next'
import { env } from 'process'

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'POST':
      return handleGetProductHubData(req, res)
    case 'PATCH':
      return updateProductHubData(req, res)
    case 'PUT':
      if (env.NODE_ENV !== 'development') {
        return res.status(405).end()
      }
      return mockProductHubData(req, res)
    default:
      return res.status(405).end()
  }
}
export default handler
