import type BigNumber from 'bignumber.js'

export interface CollateralLocked {
  ilk: string
  token: string
  collateral: BigNumber
}

export interface TotalValueLocked {
  value: BigNumber
}
