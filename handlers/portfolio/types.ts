import type { Vault } from '@prisma/client'
import type { NetworkNames } from 'blockchain/networks'
import type { OmniProductType } from 'features/omni-kit/types'
import type { TokensPrices } from 'handlers/portfolio/positions/helpers'
import type { DpmList } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type { LendingProtocol } from 'lendingProtocols'

type AutomationType = {
  enabled: boolean
  price?: number
}

export type PortfolioPositionAutomations = {
  stopLoss?: AutomationType
  takeProfit?: AutomationType
  autoBuy?: AutomationType
  autoSell?: AutomationType
}

export type PortfolioPosition = {
  availableToMigrate?: boolean
  automations: PortfolioPositionAutomations
  description?: string
  details: PositionDetail[]
  /*
  lendingType:
    if earn, and has debt -> Yield Loop (loop)
    If earn, no debt and not ajna -> Passive (passive)
    If earn, no debt and ajna -> Active Lending (active)
    the rest is just future proofing
  */
  lendingType?: 'active' | 'passive' | 'loop' | 'staking' | 'pool' // are these all types?
  network: NetworkNames
  netValue: number
  openDate?: number // epoch based on block height timestamp
  positionId: number
  primaryToken: string
  protocol: LendingProtocol
  secondaryToken: string
  type: OmniProductType
  url: string
}

export type PortfolioPositionsHandler = ({
  address,
  apiVaults,
  dpmList,
  prices,
}: {
  address: string
  apiVaults: Vault[]
  dpmList: DpmList
  prices: TokensPrices
}) => Promise<PortfolioPositionsResponse>

export type PortfolioPositionsResponse = {
  positions: PortfolioPosition[]
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

type DetailsTypeLendingRange = 'lendingRange'
export type DetailsType = DetailsTypeCommon | DetailsTypeLendingRange

export enum LendingRangeType {
  Available = 0,
  Unutilized = 1,
  Active = 2,
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
