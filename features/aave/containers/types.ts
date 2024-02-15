import type { IStrategyConfig, ProductType } from 'features/aave/types'
import type { OmniProductPage, OmniProtocolSettings } from 'features/omni-kit/types'

export interface AaveContainerProps extends OmniProductPage {
  definedStrategy: IStrategyConfig
  product: ProductType
  settings?: OmniProtocolSettings
}
