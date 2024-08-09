import {
  AaveV3LendingPoolId,
  AaveV3Protocol,
  type EmodeType,
  type IAaveV3Protocol,
  type ISparkProtocol,
  SparkLendingPoolId,
  SparkProtocol,
} from '@summer_fi/summerfi-protocol-plugins'
import { type ChainInfo, type IToken } from '@summer_fi/summerfi-sdk-common'
import { LendingProtocol } from 'lendingProtocols'

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
        protocol: AaveV3Protocol.createFrom({
          chainInfo,
        }) as IAaveV3Protocol,
        collateralToken,
        debtToken,
        emodeType,
      })
    case LendingProtocol.SparkV3:
      return SparkLendingPoolId.createFrom({
        protocol: SparkProtocol.createFrom({
          chainInfo,
        }) as ISparkProtocol,
        collateralToken,
        debtToken,
        emodeType,
      })
    default:
      throw new Error(`Unsupported lending protocol: ${lendingProtocol}`)
  }
}
