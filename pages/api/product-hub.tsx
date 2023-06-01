import { handleProductHubData, updateProductHubData } from 'handlers/product-hub'
import { NextApiHandler } from 'next'
import { env } from 'process'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return await handleProductHubData(req, res)
    case 'UPDATE':
      return await updateProductHubData(req, res)
    case 'GET':
      if (env.NODE_ENV !== 'development') {
        return res.status(405).end()
      }
      return await handleProductHubData(req, res)
    default:
      return res.status(405).end()
  }
}
export default handler
