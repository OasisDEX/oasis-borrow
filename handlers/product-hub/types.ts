import { NetworkNames } from 'blockchain/networks'
import { PromoCardProps } from 'components/PromoCard'
import { ProductHubItem } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'
import { NextApiRequest } from 'next'

export type PromoCardsCollection = 'Home' | 'HomeWithAjna' | 'AjnaLP'

export type ProductHubDataParams = {
  protocols: LendingProtocol[]
  testnet?: boolean
  dryRun?: boolean
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

export interface ParsePromoCardParams {
  collateralToken: string
  debtToken: string
  network?: NetworkNames
  pills?: PromoCardProps['pills']
  product?: ProductHubItem
  protocol: LendingProtocol
  withMaxLtvPill?: boolean
  withYieldExposurePillPill?: boolean
}
