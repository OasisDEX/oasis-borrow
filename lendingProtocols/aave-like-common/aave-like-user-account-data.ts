import type BigNumber from 'bignumber.js'

export interface AaveLikeUserAccountData {
  totalCollateral: BigNumber
  totalDebt: BigNumber
  availableBorrows: BigNumber
  currentLiquidationThreshold: BigNumber
  ltv: BigNumber
  healthFactor: BigNumber
}

export interface AaveLikeUserAccountDataArgs {
  address: string
}
