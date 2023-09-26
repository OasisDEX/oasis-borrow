import type { BigNumber } from 'bignumber.js'

export interface AaveLikeReserveConfigurationData {
  ltv: BigNumber
  liquidationThreshold: BigNumber
  liquidationBonus: BigNumber
}

export interface AaveLikeReserveConfigurationDataParams {
  collateralToken: string
  debtToken: string
}
