import type BigNumber from 'bignumber.js'

export interface AaveLikeUserAccountData {
  totalCollateral: BigNumber
  totalDebt: BigNumber
  availableBorrows: BigNumber
  currentLiquidationThreshold: BigNumber
  ltv: BigNumber
  healthFactor: BigNumber
  address?: string // position DPM address
}

export interface AaveLikeUserAccountDataArgs {
  address: string
}
