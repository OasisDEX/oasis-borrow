import type BigNumber from 'bignumber.js'
import type { RewardsPayload } from 'handlers/ajna-rewards/getAjnaRewardsData'

export interface AjnaRewards {
  bonus: BigNumber
  claimable: BigNumber
  claimableBonus: BigNumber
  regular: BigNumber
  total: BigNumber
  totalUsd: BigNumber
  payload: RewardsPayload
}
