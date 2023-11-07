import { LendingRangeType } from './lending-range'

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

export enum LendingProtocol {
  AaveV2 = 'aavev2',
  AaveV3 = 'aavev3',
  Ajna = 'ajna',
  Maker = 'maker',
  MorphoBlue = 'morphoblue',
  SparkV3 = 'sparkv3',
}

export enum ProductType {
  'Multiply' = 'Multiply',
  'Earn' = 'Earn',
  'Borrow' = 'Borrow',
}

export enum StrategyType {
  Short = 'short',
  Long = 'long',
}

type AutomationType = {
  enabled: boolean
  price?: number
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

export type PositionDetail = {
  type: DetailsType
  value: string | LendingRangeType
  accent?: 'positive' | 'negative'
  subvalue?: string
}

export type PortfolioPosition = {
  positionId: number
  type?: ProductType
  network: NetworkNames
  protocol: LendingProtocol
  strategyType?: StrategyType
  lendingType?: 'active' | 'passive' | 'loop' | 'staking' | 'pool' // are these all types?
  openDate: number // epoch based on block height timestamp
  availableToMigrate?: boolean
  tokens: {
    supply: {
      symbol: string
      amount: number
      amountUSD: number
    }
    borrow?: {
      symbol: string
      amount: number
      amountUSD: number
    }
  }
  details: PositionDetail[]
  automations: {
    stopLoss?: AutomationType
    takeProfit?: AutomationType
    autoBuy?: AutomationType
    autoSell?: AutomationType
  }
}

export type PortfolioPositionsResponse = {
  positions: PortfolioPosition[]
}

export type PortfolioOverviewResponse = {
  suppliedUsdValue: number
  suppliedPercentageChange: number
  borrowedUsdValue: number
  borrowedPercentageChange: number
  summerUsdValue: number
  summerPercentageChange: number
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
