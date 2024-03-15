import { LendingProtocol } from 'lendingProtocols'

import aaveV2Handler from './aaveV2/aaveV2Handler'
import aaveV3Handler from './aaveV3/aaveV3Handler'
import ajnaHandler from './ajna/ajnaHandler'
import erc4626Handler from './erc-4626/erc4626Handler'
import makerHandler from './maker/makerHandler'
import morphoBlueHandler from './morpho-blue/morphoBlueHandler'
import sparkV3Handler from './sparkV3/sparkV3Handler'

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
  [LendingProtocol.MorphoBlue]: morphoBlueHandler,
  [LendingProtocol.SparkV3]: sparkV3Handler,
  'erc-4626': erc4626Handler,
}
