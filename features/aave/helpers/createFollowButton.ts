import { Protocol } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { PositionId } from 'features/aave/types'
import { FollowButtonControlProps } from 'features/follow/controllers/FollowButtonControl'
import { useAccount } from 'helpers/useAccount'
import { useFeatureToggle } from 'helpers/useFeatureToggle'

export function createFollowButton(
  positionId: PositionId,
  protocol: Protocol,
  proxy: string | undefined,
  strategy: string,
) {
  const followAaveVaultsEnabled = useFeatureToggle('FollowAAVEVaults')
  const { walletAddress: connectedWalletAddress, chainId } = useAccount()
  console.log('proxy in createFollowButton')
  console.log(proxy)

  const followButton: FollowButtonControlProps | undefined =
    chainId && connectedWalletAddress && positionId.vaultId && followAaveVaultsEnabled
      ? {
          chainId,
          followerAddress: connectedWalletAddress,
          vaultId: new BigNumber(positionId.vaultId),
          protocol,
          proxy,
          strategy,
        }
      : undefined
  return followButton
}
