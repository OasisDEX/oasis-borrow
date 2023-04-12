import { BigNumber } from 'bignumber.js'

export interface ReserveData {
  availableLiquidity: BigNumber
  variableBorrowRate: BigNumber
  liquidityRate: BigNumber
}
