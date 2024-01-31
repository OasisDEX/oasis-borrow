import type BigNumber from 'bignumber.js'

export type PositionLike = {
  dpm: string
  ltv: number
  collateral: {
    token: {
      symbol: string
      address: string
      decimals: number
    }
    amount: BigNumber
  }
  debt: {
    token: {
      symbol: string
      address: string
      decimals: number
    }
    amount: BigNumber
  }
}
