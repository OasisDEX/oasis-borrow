import type { RefinanceGeneralContextBase } from 'features/refinance/contexts'
import { getEmode } from 'features/refinance/helpers/getEmode'
import { mapTokenToSdkToken } from 'features/refinance/helpers/mapTokenToSdkToken'
import { replaceTokenSymbolETHWithWETH } from 'features/refinance/helpers/replaceETHwithWETH'
import {
  AaveV3LendingPoolId,
  MorphoLendingPoolId,
  SparkLendingPoolId,
  // AaveV3LendingPoolId,
} from 'summerfi-sdk-client'
import { type IPoolId, type IProtocol, ProtocolName } from 'summerfi-sdk-common'

export const getTargetPoolId = (protocol: IProtocol, ctx: RefinanceGeneralContextBase): IPoolId => {
  const {
    environment: { chainInfo },
    form: {
      state: { strategy },
    },
  } = ctx
  if (!strategy?.primaryToken) {
    throw new Error('Primary token is required')
  }
  if (!strategy?.secondaryToken) {
    throw new Error('Secondary token is required')
  }
  const collateralToken = mapTokenToSdkToken(
    chainInfo,
    replaceTokenSymbolETHWithWETH(strategy?.primaryToken),
  )
  const debtToken = mapTokenToSdkToken(
    chainInfo,
    replaceTokenSymbolETHWithWETH(strategy?.secondaryToken),
  )

  switch (protocol.name) {
    case ProtocolName.Maker:
      throw new Error('Maker is not supported as a target protocol')
    case ProtocolName.Spark:
      return SparkLendingPoolId.createFrom({
        protocol,
        emodeType: getEmode(collateralToken, debtToken),
        collateralToken,
        debtToken,
      })
    case ProtocolName.AAVEv3:
      return AaveV3LendingPoolId.createFrom({
        protocol: {
          name: ProtocolName.AAVEv3,
          chainInfo,
        },
        emodeType: getEmode(collateralToken, debtToken),
        collateralToken,
        debtToken,
      })
    case ProtocolName.AAVEv2:
      throw new Error('AAVEv2 is not supported as a target protocol')
    case ProtocolName.Morpho:
      return MorphoLendingPoolId.createFrom({
        protocol,
        marketId: '', // TODO ref: get marketId
      })

    default:
      throw new Error(`Unsupported protocol: ${protocol.name}`)
  }
}
