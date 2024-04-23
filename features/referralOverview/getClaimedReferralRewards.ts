import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

import type { ClaimedReferralRewards } from './getClaimedReferralRewards.types'

export async function getClaimedReferralRewards(
  networkId: number,
  walletAddress: string,
): Promise<ClaimedReferralRewards[]> {
  const res = await loadSubgraph({
    subgraph: 'Referral',
    method: 'getClaimedReferralRewards',
    networkId,
    params: {
      walletAddress: walletAddress.toLowerCase(),
    },
  })

  if (res.success) {
    return res.response.claimeds
  }

  throw new Error(`Request failed, Error: ${JSON.stringify(res.error)}`)
}
