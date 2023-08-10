import { ProductHubItemTooltips, ProductHubManagementType } from 'features/productHub/types'

export interface OraclessPoolResult extends ProductHubItemTooltips {
  collateralAddress: string
  collateralToken: string
  earnStrategy?: string
  fee?: string
  liquidity?: string
  managementType?: ProductHubManagementType
  maxLtv?: string
  quoteAddress: string
  quoteToken: string
  weeklyNetApy?: string
}
