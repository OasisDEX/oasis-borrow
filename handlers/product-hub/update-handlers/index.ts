import { ProductHubHandlerResponse } from 'handlers/product-hub/types'
import { LendingProtocol } from 'lendingProtocols'

import aaveV2Handler from './aaveV2/aaveV2Handler'
import aaveV3Handler from './aaveV3/aaveV3Handler'
import ajnaHandler from './ajna/ajnaHandler'

export const PRODUCT_HUB_HANDLERS = {
  [LendingProtocol.AaveV2]: aaveV2Handler,
  [LendingProtocol.AaveV3]: aaveV3Handler,
  [LendingProtocol.Ajna]: ajnaHandler,
  [LendingProtocol.Maker]: () => Promise.resolve({}) as ProductHubHandlerResponse,
}
