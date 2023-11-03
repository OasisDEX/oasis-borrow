import { NetworkNames } from '../common/domain'

export type PortfolioAsset = {
  name: string
  network: NetworkNames
  symbol: string
  priceUSD: number
  price24hChange?: number
  balance: number
  balanceUSD: number
}

export type PortfolioAssetsResponse = {
  assets: PortfolioAsset[]
}
