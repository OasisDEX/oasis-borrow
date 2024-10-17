import BigNumber from 'bignumber.js'
import { ensureContractsExist, ensureTokensExist, getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider } from 'blockchain/networks'
import { amountFromWei } from 'blockchain/utils'
import { ethers } from 'ethers'
import type { OmniTxData } from 'features/omni-kit/hooks'
import { AaveLikeRewardsProxyActions__factory } from 'types/ethers-contracts'

import type { BaseCallParameters } from './utils'

export interface UserRewardsArgs extends BaseCallParameters {
  token: string
  account: string
  rewardsController: string
  poolDataProvider: string
}
export interface UserRewardsResponse {
  rewardsList: string[]
  unclaimedAmounts: BigNumber[]
  assets: string[]
}
export interface ClaimAllRewardsArgs extends BaseCallParameters {
  assets: string[]
  dpmAccount: string
  rewardsController: string
}

export async function getAllUserRewards({
  token,
  account,
  networkId,
  rewardsController,
  poolDataProvider,
}: UserRewardsArgs): Promise<UserRewardsResponse> {
  const rpcProvider = getRpcProvider(networkId)
  const contracts = getNetworkContracts(networkId)
  ensureTokensExist(networkId, contracts)
  ensureContractsExist(networkId, contracts, ['aaveLikeRewardsProxyActions'])

  const contract = AaveLikeRewardsProxyActions__factory.connect(
    contracts.aaveLikeRewardsProxyActions.address,
    rpcProvider,
  )
  const result = await contract.getAllUserRewards(
    rewardsController,
    poolDataProvider,
    account,
    token,
  )
  const { rewardsList, unclaimedAmounts, assets } = result

  // Format unclaimed amounts
  const formattedUnclaimedAmounts = await Promise.all(
    unclaimedAmounts.map(async (amount, index) => {
      const rewardToken = rewardsList[index]
      const tokenContract = new ethers.Contract(
        rewardToken,
        ['function decimals() view returns (uint8)'],
        rpcProvider,
      )
      const decimals = await tokenContract.decimals()
      return amountFromWei(new BigNumber(amount.toString()), decimals)
    }),
  )
  return {
    rewardsList,
    unclaimedAmounts: formattedUnclaimedAmounts,
    assets,
  }
}
export function encodeClaimAllRewards({
  networkId,
  assets,
  rewardsController,
}: ClaimAllRewardsArgs): OmniTxData {
  const contracts = getNetworkContracts(networkId)

  ensureContractsExist(networkId, contracts, ['aaveLikeRewardsProxyActions'])
  // ensureGivenTokensExist(networkId, contracts, assets)

  const { aaveLikeRewardsProxyActions } = contracts

  const proxyActionContract = AaveLikeRewardsProxyActions__factory.connect(
    aaveLikeRewardsProxyActions.address,
    getRpcProvider(networkId),
  )

  const encodeFunctionData = proxyActionContract.interface.encodeFunctionData('claimAllRewards', [
    rewardsController,
    assets,
  ])

  return {
    to: aaveLikeRewardsProxyActions.address,
    data: encodeFunctionData,
    value: '0',
  }
}
