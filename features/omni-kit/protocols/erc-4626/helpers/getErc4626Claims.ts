import type { MorphoCloseClaimRewardsPayload } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'

interface GetErc4626ClaimsParams {
  account: string
  user: string
}

interface Erc4626Claims {
  actionPayload: MorphoCloseClaimRewardsPayload
  claims: {
    token: string
    earned: BigNumber
    claimable: BigNumber
  }[]
}

export interface MorphoClaimedReward {
  urd: string
  reward: string
  rewardSymbol: string
  amount: bigint
}

export interface MorphoAggregatedClaims {
  rewardToken: {
    address: string
    symbol: string
    decimals: number
  }
  claimable: bigint
  claimed: bigint
  total: bigint
}

export interface MorphoClaims {
  claimable: {
    urd: string
    reward: string
    claimable: bigint
    proof: string[]
  }[]
  claimed: MorphoClaimedReward[]
  claimsAggregated: MorphoAggregatedClaims[]
}

export async function getErc4626Claims({
  account,
}: GetErc4626ClaimsParams): Promise<Erc4626Claims> {
  const claimsResponse = await fetch(`/api/morpho/claims?account=${account}`)

  if (claimsResponse.status !== 200) {
    console.warn('Failed to fetch claims', claimsResponse)
    return {
      actionPayload: {
        claimable: [],
        proofs: [],
        urds: [],
        rewards: [],
      },
      claims: [],
    }
  }

  const claims = (await claimsResponse.json()) as MorphoClaims

  const actionPayload: MorphoCloseClaimRewardsPayload = {
    claimable: claims.claimable.map((claim) => new BigNumber(claim.claimable.toString())),
    proofs: claims.claimable.map((claim) => claim.proof),
    urds: claims.claimable.map((claim) => claim.urd),
    rewards: claims.claimed.map((claim) => claim.reward),
  }

  const displayClaims = claims.claimsAggregated.map((claim) => {
    return {
      token: claim.rewardToken.symbol.toUpperCase(),
      earned: new BigNumber(claim.claimable.toString()).shiftedBy(-claim.rewardToken.decimals),
      claimable: new BigNumber(claim.claimed.toString()).shiftedBy(-claim.rewardToken.decimals),
    }
  })

  return {
    actionPayload,
    claims: displayClaims,
  }
}
