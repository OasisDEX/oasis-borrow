import type { RefinanceGeneralContextBase } from 'features/refinance/contexts'
import { getEmode } from 'features/refinance/helpers/getEmode'
import {
  MorphoLendingPoolId,
  SparkLendingPoolId,
  // AaveV3LendingPoolId,
} from 'summerfi-sdk-client'
import { type IPoolId, type IProtocol, ProtocolName } from 'summerfi-sdk-common'

export const getTargetPoolId = (protocol: IProtocol, ctx: RefinanceGeneralContextBase): IPoolId => {
  const {
    position: { collateralTokenData, debtTokenData },
  } = ctx
  switch (protocol.name) {
    case ProtocolName.Maker:
      throw new Error('Maker is not supported as a target protocol')
    case ProtocolName.Spark:
      return SparkLendingPoolId.createFrom({
        protocol,
        emodeType: getEmode(collateralTokenData, debtTokenData),
        collateralToken: collateralTokenData.token,
        debtToken: debtTokenData.token,
      })
    // case ProtocolName.AAVEv3:
    //   return AaveV3LendingPoolId.createFrom({
    //     protocol: {
    //       name: ProtocolName.Spark,
    //       chainInfo,
    //     },
    //     emodeType,
    //     collateralToken,
    //     debtToken,
    //   })
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
