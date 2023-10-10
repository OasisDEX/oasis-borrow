import type { NetworkIds } from 'blockchain/networks'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

import type { GetAjnaRewards } from './getAjnaRewards.types'

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
