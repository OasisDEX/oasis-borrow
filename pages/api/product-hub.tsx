import { handleProductHubData, updateProductHubData } from 'handlers/product-hub'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case 'POST':
      return await handleProductHubData(req, res)
    case 'UPDATE':
      return await updateProductHubData(req, res)
    default:
      return res.status(405).end()
  }
}
export default handler
