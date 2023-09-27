import type { ProductHubItemTooltips, ProductHubManagementType } from 'features/productHub/types'

import type { EarnStrategies } from '.prisma/client'

export interface SearchTokensResponse {
  symbol: string
  address: string
}

export interface PoolFinderFormState {
  poolAddress: string
  collateralAddress: string
  quoteAddress: string
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
  quoteAddress: string
  quoteToken: string
  weeklyNetApy?: string
  collateralIcon: string
  quoteIcon: string
}
