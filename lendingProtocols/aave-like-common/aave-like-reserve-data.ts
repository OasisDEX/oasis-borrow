import type { BigNumber } from 'bignumber.js'

export interface AaveLikeReserveData {
  availableLiquidity: BigNumber
  variableBorrowRate: BigNumber
  liquidityRate: BigNumber
}
