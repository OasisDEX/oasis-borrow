import { LendingProtocol } from 'lendingProtocols'
import { AaveV3LendingPoolId, type EmodeType, SparkLendingPoolId } from 'summerfi-sdk-client'
import { type ChainInfo, type IToken, ProtocolName } from 'summerfi-sdk-common'

export const getAaveLikePoolId = (
  lendingProtocol: LendingProtocol,
  chainInfo: ChainInfo,
  collateralToken: IToken,
  debtToken: IToken,
  emodeType: EmodeType,
) => {
  switch (lendingProtocol) {
    case LendingProtocol.AaveV3:
      return AaveV3LendingPoolId.createFrom({
        protocol: {
          name: ProtocolName.AAVEv3,
          chainInfo,
        },
        collateralToken,
        debtToken,
        emodeType,
      })
    case LendingProtocol.SparkV3:
      return SparkLendingPoolId.createFrom({
        protocol: {
          name: ProtocolName.Spark,
          chainInfo,
        },
        collateralToken,
        debtToken,
        emodeType,
      })
    default:
      throw new Error(`Unsupported lending protocol: ${lendingProtocol}`)
  }
}
