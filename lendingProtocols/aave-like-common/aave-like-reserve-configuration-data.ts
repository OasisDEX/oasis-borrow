import { BigNumber } from 'bignumber.js'

export interface AaveLikeReserveConfigurationData {
  ltv: BigNumber
  liquidationThreshold: BigNumber
  liquidationBonus: BigNumber
}

export interface AaveReserveConfigurationDataParams {
  collateralToken: string
  debtToken: string
}
