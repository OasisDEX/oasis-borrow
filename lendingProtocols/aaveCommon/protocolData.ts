import { IPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { AaveV2UserReserveData } from 'blockchain/aave'
import { AaveV3UserReserveData } from 'blockchain/aave-v3'

import { UserAccountData } from './userAccountData'

type ConfigurationData = string[]

export interface ProtocolData {
  positionData: AaveV3UserReserveData | AaveV2UserReserveData
  accountData: UserAccountData
  oraclePrice: BigNumber
  position: IPosition
  userConfiguration: ConfigurationData
  reservesList: ConfigurationData
}
