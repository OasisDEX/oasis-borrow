import type { NetworkNames } from 'blockchain/networks'
import type { ProductType, StrategyType } from 'features/aave/types'
import type { DpmList } from 'handlers/portfolio/positions/handlers/dpm'
import type { LendingProtocol } from 'lendingProtocols'

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

export type PortfolioPositionsHandler = ({
  address,
  dpmList,
}: {
  address: string
  dpmList: DpmList
}) => Promise<PortfolioPositionsResponse>

export type PortfolioPositionsResponse = {
  positions: PortfolioPosition[]
  address: string
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

export enum LendingRangeType {
  belowHtp = 'belowHtp',
  belowLup = 'belowLup',
  aboveLup = 'aboveLup',
}
