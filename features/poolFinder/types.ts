import { ProductHubItemTooltips } from "features/productHub/types"

export interface OraclessPoolResult extends ProductHubItemTooltips {
  collateralAddress: string
  collateralToken: string
  fee: string
  liquidity: string
  maxLtv?: string
  quoteAddress: string
  quoteToken: string
}
