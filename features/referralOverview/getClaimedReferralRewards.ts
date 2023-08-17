import { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface ClaimedReferralRewards {
  id: string
  week: number
}

export async function getClaimedReferralRewards(walletAddress: string): Promise<ClaimedReferralRewards[]> {
  const { response } = (await loadSubgraph('Referral', 'getClaimedReferralRewards', {
    walletAddress: walletAddress.toLowerCase(),
  })) as SubgraphsResponses['Referral']['getClaimedReferralRewards']

  if (response && 'claimeds' in response) {
    return response.claimeds
  }

  throw new Error(
    `No claimeds data found for address: ${walletAddress}, Response: ${JSON.stringify(
      response,
    )}`,
  )
}
