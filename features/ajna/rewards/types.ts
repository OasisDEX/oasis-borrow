import type BigNumber from 'bignumber.js'

export interface AjnaRewards {
  bonus: BigNumber
  claimable: BigNumber
  regular: BigNumber
  total: BigNumber
  totalUsd: BigNumber
}
