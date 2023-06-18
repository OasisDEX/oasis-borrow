import { ProductHubItem } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'
import { NextApiRequest } from 'next'

export type PromoCardsCollection = 'Home' | 'AjnaLP'

export type ProductHubDataParams = {
  protocols: LendingProtocol[]
  testnet?: boolean
}
export interface HandleGetProductHubDataProps extends NextApiRequest {
  body: ProductHubDataParams & {
    promoCardsCollection: PromoCardsCollection
  }
}
export interface HandleUpdateProductHubDataProps extends NextApiRequest {
  body: ProductHubDataParams
}

export interface ProductHubHandlerResponseData {
  table: ProductHubItem[]
  warnings: string[]
}

export type ProductHubHandlerResponse = Promise<ProductHubHandlerResponseData>
