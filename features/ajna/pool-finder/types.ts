import type { NetworkIds } from 'blockchain/networks'
import type { ProductHubItemTooltips, ProductHubManagementType } from 'features/productHub/types'

import type { EarnStrategies } from '.prisma/client'

export interface SearchTokensResponse {
  symbol: string
  address: string
}

export interface PoolFinderFormState {
  poolAddress: string
  collateralToken: string
  quoteToken: string
}

export interface OraclessPoolResult extends ProductHubItemTooltips {
  collateralAddress: string
  collateralToken: string
  earnStrategy?: EarnStrategies
  earnStrategyDescription?: string
  fee?: string
  liquidity?: string
  managementType?: ProductHubManagementType
  maxLtv?: string
  networkId: NetworkIds
  quoteAddress: string
  quoteToken: string
  weeklyNetApy?: string
  collateralIcon: string
  quoteIcon: string
}
