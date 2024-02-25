import type { BigNumber } from 'bignumber.js'

export interface AaveLikeReserveData {
  tokenAddress: string
  variableDebtAddress: string
  availableLiquidity: BigNumber
  variableBorrowRate: BigNumber
  liquidityRate: BigNumber
  caps: {
    borrow: BigNumber
    supply: BigNumber
  }
  totalDebt: BigNumber
  totalSupply: BigNumber
  availableToBorrow: BigNumber
  availableToSupply: BigNumber
}
