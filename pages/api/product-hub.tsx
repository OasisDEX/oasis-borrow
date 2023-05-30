import {
  handleGetProductHubData,
  mockProductHubData,
  updateProductHubData,
} from 'handlers/product-hub'
import { NextApiHandler } from 'next'
import { env } from 'process'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return await handleGetProductHubData(req, res)
    case 'PATCH':
      return await updateProductHubData(req, res)
    case 'PUT':
      if (env.NODE_ENV !== 'development') {
        return res.status(405).end()
      }
      return await mockProductHubData(req, res)
    default:
      return res.status(405).end()
  }
}
export default handler
