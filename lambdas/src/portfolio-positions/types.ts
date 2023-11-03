import { LendingProtocol, NetworkNames } from '../common/domain'

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
  value: string
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
