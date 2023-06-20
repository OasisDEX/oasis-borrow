import { BigNumber } from 'bignumber.js'

export interface ReserveConfigurationData {
  ltv: BigNumber
  liquidationThreshold: BigNumber
  liquidationBonus: BigNumber
}

export interface AaveReserveConfigurationDataParams {
  collateralToken: string
  debtToken: string
}
