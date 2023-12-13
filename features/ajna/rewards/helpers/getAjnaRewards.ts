import type { NetworkIds } from 'blockchain/networks'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

import type { AjnaRewardsSource } from '.prisma/client'

export interface AjnaClaimedReward {
  week: number
  type: AjnaRewardsSource
}
export type GetAjnaRewards = (
  walletAddress: string,
  networkId: NetworkIds,
) => Promise<AjnaClaimedReward[]>

export const getAjnaRewards: GetAjnaRewards = async (
  walletAddress: string,
  networkId: NetworkIds,
) => {
  const { response } = (await loadSubgraph('Ajna', 'getAjnaClaimedRewards', networkId, {
    walletAddress: walletAddress.toLowerCase(),
  })) as SubgraphsResponses['Ajna']['getAjnaClaimedRewards']

  if (response && 'claimeds' in response) {
    return response.claimeds.map((claimed) => ({
      week: claimed.week.week,
      type: claimed.type,
    }))
  }

  throw new Error('No claimed rewards data found')
}
