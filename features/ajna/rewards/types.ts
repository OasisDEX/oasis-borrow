import type BigNumber from 'bignumber.js'

export interface AjnaRewards {
  balance: BigNumber
  balanceUsd: BigNumber
  claimable: BigNumber
}
