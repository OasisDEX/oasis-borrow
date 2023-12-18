import type BigNumber from 'bignumber.js'

export enum TriggerFlow {
  add = 'add',
  edit = 'edit',
  cancel = 'cancel',
}

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
