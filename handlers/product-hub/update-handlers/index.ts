import { LendingProtocol } from 'lendingProtocols'

import aaveV2Handler from './aaveV2Handler'

export const PRODUCT_HUB_HANDLERS = {
  [LendingProtocol.AaveV2]: aaveV2Handler,
  [LendingProtocol.AaveV3]: () => ({}),
  [LendingProtocol.Ajna]: () => ({}),
  [LendingProtocol.Maker]: () => ({}),
}
