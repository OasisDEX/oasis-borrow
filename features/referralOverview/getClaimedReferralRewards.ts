import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface ClaimedReferralRewards {
  week: {
    id: string
    week: string
  }
}

export async function getClaimedReferralRewards(
  walletAddress: string,
): Promise<ClaimedReferralRewards[]> {
  const res = await loadSubgraph('Referral', 'getClaimedReferralRewards', {
    walletAddress: walletAddress.toLowerCase(),
  })

  if (res.success) {
    return res.response.claimeds
  }

  throw new Error(`Request failed, Error: ${JSON.stringify(res.error)}`)
}
