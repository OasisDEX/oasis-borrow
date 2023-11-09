import type { NetworkNames } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
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

type DetailsTypeCommon =
  | '90dApy'
  | 'apy'
  | 'borrowedToken'
  | 'borrowedTokenBalance'
  | 'borrowRate'
  | 'collateralLocked'
  | 'earnings'
  | 'liquidationPrice'
  | 'ltv'
  | 'multiple'
  | 'netValue'
  | 'netValueEarnActivePassive'
  | 'pnl'
  | 'suppliedToken'
  | 'suppliedTokenBalance'
  | 'totalDebt'

export type DetailsTypeLendingRange = 'lendingRange'
export type DetailsType = DetailsTypeCommon & DetailsTypeLendingRange

export enum LendingRangeType {
  Active = 1,
  Unutilized = 2,
  Available = 3,
}

export type PositionDetailCommon = {
  type: DetailsTypeCommon
  value: string
}
export type PositionDetailLendingRange = {
  type: DetailsTypeLendingRange
  value: LendingRangeType
}

export type PositionDetail = (PositionDetailCommon | PositionDetailLendingRange) & {
  accent?: 'positive' | 'negative'
  subvalue?: string
}
