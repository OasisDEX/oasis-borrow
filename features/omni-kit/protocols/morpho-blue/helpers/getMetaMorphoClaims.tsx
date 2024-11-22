import type { MorphoCloseClaimRewardsPayload, Network } from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider } from 'blockchain/networks'
import { getTokenGuarded, getTokenSymbolBasedOnAddress } from 'blockchain/tokensMetadata'
import { amountFromWei } from 'blockchain/utils'
import { omniNetworkMap } from 'features/omni-kit/constants'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'

export enum MetaMorphoClaimsType {
  BORROW = 'borrow',
  SUPPLY = 'supply',
}

interface GetMetaMorphoClaimsParams {
  account: string
  networkId: OmniSupportedNetworkIds
  claimType: MetaMorphoClaimsType
}

interface MetaMorphoClaimsApiResponse {
  claimable: {
    amount: string
    claimable: string
    proof: string[]
    rewardTokenAddress: string
    rewardSymbol: string
    urd: string
  }[]
  claimsAggregated: {
    accrued: string
    amount: string
    claimable: string
    claimed: string
    rewardTokenAddress: string
    total: string
  }[]
}

export async function getMetaMorphoClaims({
  account,
  networkId,
  claimType,
}: GetMetaMorphoClaimsParams) {
  try {
    const response = (await (
      await fetch(
        `/api/morpho/claims?account=${account}&chainId=${networkId}&claimType=${claimType}`,
      )
    ).json()) as MetaMorphoClaimsApiResponse

    const tx = await strategies.morphoblue.common.claimRewards(
      response.claimable.reduce<MorphoCloseClaimRewardsPayload>(
        (total, { claimable, proof, rewardTokenAddress, urd }) => ({
          urds: [...total.urds, urd],
          rewards: [...total.rewards, rewardTokenAddress],
          claimable: [...total.claimable, new BigNumber(claimable)],
          proofs: [...total.proofs, proof],
        }),
        {
          urds: [],
          rewards: [],
          claimable: [],
          proofs: [],
        },
      ),
      {
        network: omniNetworkMap[networkId] as Network,
        operationExecutor: getNetworkContracts(networkId).operationExecutor.address,
        provider: getRpcProvider(networkId),
      },
    )

    return {
      claims: response.claimsAggregated
        .map(({ accrued, claimable, claimed, rewardTokenAddress }) => {
          const tokenSymbol = getTokenSymbolBasedOnAddress(networkId, rewardTokenAddress)
          const token = getTokenGuarded(tokenSymbol)

          if (!tokenSymbol || !token) {
            throw Error('Token symbol or token not defined in morpho claims')
          }

          return {
            address: rewardTokenAddress,
            token: tokenSymbol.toUpperCase(),
            earned: amountFromWei(
              new BigNumber(accrued).minus(new BigNumber(claimed)),
              token.precision,
            ),
            claimable: amountFromWei(new BigNumber(claimable), token.precision),
          }
        })
        .filter((item) => item),
      tx,
    }
  } catch (e) {
    console.error('getMetaMorphoClaims error', e)
    return {
      claims: [],
    }
  }
}
