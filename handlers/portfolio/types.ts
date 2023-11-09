import type { NetworkNames } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import type { StrategyType } from 'features/aave/types'
import type { OmniProductType } from 'features/omni-kit/types'
import type { DpmList } from 'handlers/portfolio/positions/handlers/dpm'
import type { LendingProtocol } from 'lendingProtocols'

export type PortfolioPosition = {
  availableToMigrate?: boolean
  automations: {
    stopLoss?: AutomationType
    takeProfit?: AutomationType
    autoBuy?: AutomationType
    autoSell?: AutomationType
  }
  details: PositionDetail[]
  lendingType?: 'active' | 'passive' | 'loop' | 'staking' | 'pool' // are these all types?
  network: NetworkNames
  netValue: number
  openDate?: number // epoch based on block height timestamp
  positionId: number
  primaryToken: string
  protocol: LendingProtocol
  secondaryToken: string
  strategyType?: StrategyType
  type?: OmniProductType
  url: string
}

export type PortfolioPositionsHandler = ({
  address,
  dpmList,
}: {
  tickers: Tickers
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
