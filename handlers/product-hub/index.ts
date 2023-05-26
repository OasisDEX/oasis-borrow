import { oasisCreateData as data } from 'helpers/mocks/oasisCreateData.mock'
import { NextApiRequest, NextApiResponse } from 'next'

export async function handleProductHubData(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json(data)
}

export async function updateProductHubData(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({})
}
