import type { MorphoCloseClaimRewardsPayload } from '@oasisdex/dma-library'
import { Network, strategies } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { amountFromWei } from 'blockchain/utils'

interface GetMetaMorphoClaimsParams {
  account: string
}

interface MetaMorphoClaimsApiResponse {
  claimable: {
    amount: string
    claimable: string
    proof: string[]
    reward: {
      address: string
      decimals: number
      symbol: string
      name: string
    }
    rewardSymbol: string
    urd: string
  }[]
  claimsAggregated: {
    accrued: string
    amount: string
    claimable: string
    claimed: string
    rewardToken: {
      address: string
      decimals: number
      symbol: string
      name: string
      price?: string
    }
    total: string
  }[]
}

export async function getMetaMorphoClaims({ account }: GetMetaMorphoClaimsParams) {
  try {
    const response = (await (
      await fetch(`/api/morpho/claims?account=${account}`)
    ).json()) as MetaMorphoClaimsApiResponse

    const tx = await strategies.morphoblue.common.claimRewards(
      response.claimable.reduce<MorphoCloseClaimRewardsPayload>(
        (total, { claimable, proof, reward: { address }, urd }) => ({
          urds: [...total.urds, urd],
          rewards: [...total.rewards, address],
          claimable: [...total.claimable, new BigNumber(claimable)],
          proofs: [...total.proofs, proof],
        }),
        {
          urds: [],
          rewards: [],
          claimable: [],
          proofs: [[]],
        },
      ),
      {
        network: Network.MAINNET,
        operationExecutor: getNetworkContracts(NetworkIds.MAINNET).operationExecutor.address,
        provider: getRpcProvider(NetworkIds.MAINNET),
      },
    )

    return {
      claims: response.claimsAggregated.map(
        ({ accrued, claimable, claimed, rewardToken: { address, decimals, symbol } }) => ({
          address,
          token: symbol.toUpperCase(),
          earned: amountFromWei(new BigNumber(accrued).minus(new BigNumber(claimed)), decimals),
          claimable: amountFromWei(new BigNumber(claimable), decimals),
        }),
      ),
      tx,
    }
  } catch (e) {
    return {
      claims: [],
    }
  }
}
