import { type EmodeType, MakerLendingPoolId, SparkLendingPoolId } from 'summerfi-sdk-client'
import {
  type ChainFamilyInfo,
  type ChainInfo,
  type IToken,
  ProtocolName,
} from 'summerfi-sdk-common'

export const getMakerPoolId = (
  chainInfo: ChainFamilyInfo,
  ilkType: string,
  collateralToken: IToken,
  debtToken: IToken,
) => {
  return MakerLendingPoolId.createFrom({
    protocol: {
      name: ProtocolName.Maker,
      chainInfo,
    },
    ilkType,
    collateralToken,
    debtToken,
  })
}

export const getSparkPoolId = (
  chainInfo: ChainFamilyInfo | ChainInfo,
  emodeType: EmodeType,
  collateralToken: IToken,
  debtToken: IToken,
) => {
  return SparkLendingPoolId.createFrom({
    protocol: {
      name: ProtocolName.Spark,
      chainInfo,
    },
    emodeType,
    collateralToken,
    debtToken,
  })
}

// export const getAavev3PoolId = (chainInfo: ChainFamilyInfo) => {
//   throw new Error('Not implemented')
// }
