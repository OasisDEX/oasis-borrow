import BigNumber from 'bignumber.js'
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

    return {
      claims: response.claimsAggregated.map(
        ({ accrued, claimable, claimed, rewardToken: { address, decimals, symbol } }) => ({
          address,
          token: symbol,
          earned: amountFromWei(
            new BigNumber(accrued).minus(new BigNumber(claimable)).minus(new BigNumber(claimed)),
            decimals,
          ),
          claimable: amountFromWei(new BigNumber(claimable), decimals),
        }),
      ),
      payload: {
        claimable: response.claimable.map(({ claimable }) => new BigNumber(claimable)),
        proofs: response.claimable.map(({ proof }) => proof),
        rewards: response.claimable.map(({ reward: { address } }) => address),
        urds: response.claimable.map(({ urd }) => urd),
      },
    }
  } catch (e) {
    return {
      claims: [],
    }
  }
}
