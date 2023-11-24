import type { NetworkIds } from 'blockchain/networks'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

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

export const getAjnaRewards: GetAjnaRewards = async (
  walletAddress: string,
  networkId: NetworkIds,
) => {
  const { response } = (await loadSubgraph('Ajna', 'getAjnaClaimedRewards', networkId, {
    walletAddress: walletAddress.toLowerCase(),
  })) as SubgraphsResponses['Ajna']['getAjnaClaimedRewards']

  if (response && 'claimeds' in response) {
    return response.claimeds
  }

  throw new Error('No claimed rewards data found')
}
