import type { Vault } from '@prisma/client'
import type { NetworkNames } from 'blockchain/networks'
import type { OmniProductType } from 'features/omni-kit/types'
import type { MakerPoolId, SparkPoolId } from 'features/refinance/types'
import type { TokensPricesList } from 'handlers/portfolio/positions/helpers'
import type { DpmSubgraphData } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type { HistoryResponse } from 'handlers/portfolio/positions/helpers/getHistoryData'
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
  constantMultiple?: AutomationType
}

export type PortfolioPosition = {
  assetLabel?: string
  availableToMigrate?: boolean
  availableToRefinance?: boolean
  automations: PortfolioPositionAutomations
  description?: string
  details: PositionDetail[]
  rawPositionDetails?: {
    collateral: string
    debt: string
    collateralPrice: string
    debtPrice: string
    liquidationPrice: string
    ltv: string
    maxLtv: string
    borrowRate: string
    poolId: MakerPoolId | SparkPoolId
  }
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
  isOraclessAndNotEmpty?: boolean
  openDate?: number // epoch based on block height timestamp
  pairId?: number
  positionId: number | string
  primaryToken: string
  protocol: LendingProtocol
  secondaryToken: string
  type?: OmniProductType
  url: string
  debuggingData?: any
}
interface PortfolioPositionsCommonReply {
  error?: boolean | string
  errorJson?: boolean | string
}

export interface PortfolioPositionsCountReply extends PortfolioPositionsCommonReply {
  positions: {
    positionId: PortfolioPosition['positionId']
  }[]
}

export interface PortfolioPositionsReply extends PortfolioPositionsCommonReply {
  positions: PortfolioPosition[]
}

export type PortfolioPositionsHandler = ({
  address,
  apiVaults,
  dpmList,
  prices,
  positionsCount,
  debug,
}: {
  address: string
  apiVaults?: Vault[]
  dpmList: DpmSubgraphData[]
  prices: TokensPricesList
  positionsCount?: boolean
  allPositionsHistory?: HistoryResponse
  debug?: boolean
}) => Promise<PortfolioPositionsReply | PortfolioPositionsCountReply>

export type DetailsTypeCommon =
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
  Unutilized = 0,
  Available = 1,
  Active = 2,
}

export type PositionDetailCommon = {
  type: DetailsTypeCommon
  value: string
  symbol?: string
}
export type PositionDetailLendingRange = {
  type: DetailsTypeLendingRange
  value: LendingRangeType
  symbol?: string
}

export type PositionDetail = (PositionDetailCommon | PositionDetailLendingRange) & {
  accent?: 'positive' | 'negative'
  subvalue?: string
}
