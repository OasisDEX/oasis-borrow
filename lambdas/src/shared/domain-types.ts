export enum NetworkNames {
  ethereumMainnet = 'ethereum',
  ethereumGoerli = 'ethereum_goerli',
  arbitrumMainnet = 'arbitrum',
  arbitrumGoerli = 'arbitrum_goerli',
  polygonMainnet = 'polygon',
  polygonMumbai = 'polygon_mumbai',
  optimismMainnet = 'optimism',
  optimismGoerli = 'optimism_goerli',
  baseMainnet = 'base',
  baseGoerli = 'base_goerli',
}

export type DetailsType =
  | 'netValue'
  | 'netValueEarnActivePassive'
  | 'pnl'
  | 'liquidationPrice'
  | 'ltv'
  | 'multiple'
  | 'collateralLocked'
  | 'totalDebt'
  | 'borrowRate'
  | 'lendingRange'
  | 'earnings'
  | 'apy'
  | '90dApy'
  | 'suppliedToken'
  | 'suppliedTokenBalance'
  | 'borrowedToken'
  | 'borrowedTokenBalance'

export type PortfolioOverviewResponse = {
  suppliedUsdValue: number
  suppliedPercentageChange: number
  borrowedUsdValue: number
  borrowedPercentageChange: number
  summerUsdValue: number
  summerPercentageChange: number
  allAssetsUsdValue: number
}

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
  totalAssetsUsdValue: number
  totalAssetsPercentageChange: number
  assets: PortfolioAsset[]
}
