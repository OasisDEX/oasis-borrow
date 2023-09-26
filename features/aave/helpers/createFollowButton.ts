import type { Protocol } from '@prisma/client'
import BigNumber from 'bignumber.js'
import type { PositionId } from 'features/aave/types'
import type { FollowButtonControlProps } from 'features/follow/controllers/FollowButtonControl'
import { getLocalAppConfig } from 'helpers/config'
import { useAccount } from 'helpers/useAccount'

export function createFollowButton(positionId: PositionId, protocol: Protocol) {
  const { FollowAAVEVaults: followAaveVaultsEnabled } = getLocalAppConfig('features')
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
