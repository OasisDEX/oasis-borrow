import type { NetworkNames } from 'blockchain/networks'
import type { PromoCardProps } from 'components/PromoCard.types'
import type { ProductHubItem } from 'features/productHub/types'
import type { LendingProtocol } from 'lendingProtocols'
import type { NextApiRequest } from 'next'

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
