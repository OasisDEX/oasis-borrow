import aaveV2Handler from 'handlers/product-hub/update-handlers/aaveV2/aaveV2Handler'
import aaveV3Handler from 'handlers/product-hub/update-handlers/aaveV3/aaveV3Handler'
import ajnaHandler from 'handlers/product-hub/update-handlers/ajna/ajnaHandler'
import makerHandler from 'handlers/product-hub/update-handlers/maker/makerHandler'
import sparkV3Handler from 'handlers/product-hub/update-handlers/sparkV3/sparkV3Handler'
import { LendingProtocol } from 'lendingProtocols'

export const emptyHandler = async () => {
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
  [LendingProtocol.SparkV3]: sparkV3Handler,
}
