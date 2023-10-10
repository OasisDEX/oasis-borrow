import type { NetworkIds } from 'blockchain/networks'

export interface AjnaClaimedReward {
  id: number
  user: string
  week: number
  amount: number
}
export type GetAjnaRewards = (
  walletAddress: string,
  networkId: NetworkIds,
) => Promise<AjnaClaimedReward[]>
