import { LendingProtocol } from 'lendingProtocols'

import aaveV2Handler from './aaveV2/aaveV2Handler'
import aaveV3Handler from './aaveV3/aaveV3Handler'
import ajnaHandler from './ajna/ajnaHandler'
import makerHandler from './maker/makerHandler'

const emptyHandler = async () => {
  return {
    table: [],
    warnings: [],
  }
}

export const PRODUCT_HUB_HANDLERS = {
  [LendingProtocol.AaveV2]: aaveV2Handler,
  [LendingProtocol.AaveV3]: aaveV3Handler,
  [LendingProtocol.Ajna]: ajnaHandler,
  [LendingProtocol.Maker]: makerHandler,
  [LendingProtocol.SparkV3]: emptyHandler, // TODO: add Spark handler
}
