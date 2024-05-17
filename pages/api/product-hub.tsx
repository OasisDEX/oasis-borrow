import { updateProductHubData } from 'handlers/product-hub'
import type { NextApiHandler } from 'next'

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'PATCH':
      return updateProductHubData(req, res)
    default:
      return res.status(405).end()
  }
}
export default handler
