import { BigNumber } from 'bignumber.js'

export interface ReserveConfigurationData {
  ltv: BigNumber
  liquidationThreshold: BigNumber
  liquidationBonus: BigNumber
}
