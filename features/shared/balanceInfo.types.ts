import type { BigNumber } from 'bignumber.js'

export interface BalanceInfo {
  collateralBalance: BigNumber
  ethBalance: BigNumber
  daiBalance: BigNumber
}

export interface BalanceInfoChange {
  kind: 'balanceInfo'
  balanceInfo: BalanceInfo
}
