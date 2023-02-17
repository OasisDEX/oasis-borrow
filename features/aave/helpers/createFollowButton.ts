import { Protocol } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { PositionId } from 'features/aave/types'
import { FollowButtonControlProps } from 'features/follow/controllers/FollowButtonControl'
import { useAccount } from 'helpers/useAccount'
import { useFeatureToggle } from 'helpers/useFeatureToggle'

export function createFollowButton(positionId: PositionId, protocol: Protocol) {
  const followAaveVaultsEnabled = useFeatureToggle('FollowAAVEVaults')
  const { walletAddress: connectedWalletAddress, chainId } = useAccount()

  const followButton: FollowButtonControlProps | undefined =
    chainId && connectedWalletAddress && positionId.vaultId && followAaveVaultsEnabled
      ? {
          chainId,
          followerAddress: connectedWalletAddress,
          vaultId: new BigNumber(positionId.vaultId),
          protocol: protocol,
        }
      : undefined
  return followButton
}
