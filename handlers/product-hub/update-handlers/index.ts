import { ProductHubHandlerResponse } from 'handlers/product-hub/types'
import { LendingProtocol } from 'lendingProtocols'

import aaveV2Handler from './aaveV2Handler'
import ajnaHandler from './ajnaHandler'

export const PRODUCT_HUB_HANDLERS = {
  [LendingProtocol.AaveV2]: aaveV2Handler,
  [LendingProtocol.AaveV3]: () => Promise.resolve({}) as ProductHubHandlerResponse,
  [LendingProtocol.Ajna]: ajnaHandler,
  [LendingProtocol.Maker]: () => Promise.resolve({}) as ProductHubHandlerResponse,
}
