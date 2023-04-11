import { IPosition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { AaveV2UserAccountData, AaveV2UserReserveData } from 'blockchain/aave'
import { AaveV3UserAccountData, AaveV3UserReserveData } from 'blockchain/aave-v3'

type ConfigurationData = string[]

export interface ProtocolData {
  positionData: AaveV3UserReserveData | AaveV2UserReserveData
  accountData: AaveV3UserAccountData | AaveV2UserAccountData
  oraclePrice: BigNumber
  position: IPosition
  userConfiguration: ConfigurationData
  reservesList: ConfigurationData
}
