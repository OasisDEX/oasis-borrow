import type { IPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { AaveV2UserReserveData } from 'blockchain/aave'
import type { AaveV3UserReserveData } from 'blockchain/aave-v3'
import type { SparkV3UserReserveData } from 'blockchain/spark-v3'

import type { AaveLikeUserAccountData } from './aave-like-user-account-data'

type ConfigurationData = string[]

export interface AaveLikeProtocolData {
  positionData: AaveV3UserReserveData | AaveV2UserReserveData | SparkV3UserReserveData
  accountData: AaveLikeUserAccountData
  oraclePrice: BigNumber
  position: IPosition
  userConfiguration: ConfigurationData
  reservesList: ConfigurationData
}
