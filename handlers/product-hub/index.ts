import { productHubData as data } from 'helpers/mocks/productHubData.mock'
import { LendingProtocol } from 'lendingProtocols'
import { NextApiRequest, NextApiResponse } from 'next'

export type PromoCardsCollection = 'Home' | 'AjnaLP'

export type ProductHubDataParams = {
  protocol: LendingProtocol[]
  promoCardsCollection: PromoCardsCollection
}
export interface HandleProductHubDataProps extends NextApiRequest {
  body: ProductHubDataParams
}

export async function handleProductHubData(req: HandleProductHubDataProps, res: NextApiResponse) {
  const { protocol, promoCardsCollection } = req.body
  console.log('handleProductHubData', {
    protocol,
    promoCardsCollection,
  })
  return res.status(200).json(data)
}

export async function updateProductHubData(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({})
}
