import BigNumber from 'bignumber.js'

export interface UserAccountData {
  totalCollateral: BigNumber
  totalDebt: BigNumber
  availableBorrows: BigNumber
  currentLiquidationThreshold: BigNumber
  ltv: BigNumber
  healthFactor: BigNumber
}

export interface UserAccountDataArgs {
  address: string
}
