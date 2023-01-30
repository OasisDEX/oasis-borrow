import { UsersWhoFollowVaults } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { LIMIT_OF_FOLLOWED_VAULTS } from 'features/automation/common/consts'
import {
  FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE,
  FollowedVaultsLimitReachedChange,
} from 'features/automation/follow/followedVaultsLimitReached'
import { FollowButton } from 'features/follow/common/FollowButton'
import {
  followVaultUsingApi,
  getFollowFromApi,
  unfollowVaultUsingApi,
} from 'features/shared/followApi'
import { jwtAuthGetToken } from 'features/shared/jwt'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useEffect, useState } from 'react'
import { SxStyleProp } from 'theme-ui'

export type FollowButtonControlProps = {
  chainId: number
  followerAddress: string
  short?: boolean
  sx?: SxStyleProp
  vaultId: BigNumber
}

export function FollowButtonControl({
  chainId,
  followerAddress,
  short,
  sx,
  vaultId,
}: FollowButtonControlProps) {
  const { uiChanges } = useAppContext()

  const [isFollowing, setIsFollowing] = useState(false)
  const [isProcessing, setProcessing] = useState(true)
  const [isLimitReachedState] = useUIChanges<FollowedVaultsLimitReachedChange>(
    FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE,
  )

  useEffect(() => {
    void getFollowFromApi(followerAddress)
      .then((resp) => {
        handleGetFollowedVaults(resp)
      })
      .finally(() => {
        setProcessing(false)
      })
  }, [])

  function handleGetFollowedVaults(resp: UsersWhoFollowVaults[]) {
    const followedVaults = Object.values(resp)
    const currentFollowedVault = followedVaults.find(
      (item) =>
        new BigNumber(item.vault_id).eq(vaultId) && new BigNumber(item.vault_chain_id).eq(chainId),
    )
    setIsFollowing(currentFollowedVault !== undefined)

    uiChanges.publish(FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE, {
      type: 'followed-vaults-limit-reached-change',
      isLimitReached: followedVaults.length >= LIMIT_OF_FOLLOWED_VAULTS,
    })
    setProcessing(false) // this is required finally doesn't handle it!
  }

  async function buttonClickHandler() {
    setProcessing(true)
    const jwtToken = jwtAuthGetToken(followerAddress)
    if (vaultId && jwtToken) {
      if (!isFollowing) {
        await followVault(jwtToken)
      } else {
        await unfollowVault(jwtToken)
      }
    }
  }

  return (
    <FollowButton
      isProcessing={isProcessing}
      isFollowing={isFollowing}
      isLimitReached={isLimitReachedState?.isLimitReached || false}
      buttonClickHandler={buttonClickHandler}
      short={short}
      sx={sx}
    />
  )

  async function unfollowVault(jwtToken: string) {
    await unfollowVaultUsingApi(vaultId, chainId, jwtToken)
    setIsFollowing(false)
    setProcessing(false)
    uiChanges.publish(FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE, {
      type: 'followed-vaults-limit-reached-change',
      isLimitReached: false,
    })
  }

  async function followVault(jwtToken: string) {
    const followedVaults = await followVaultUsingApi(vaultId, chainId, jwtToken)

    handleGetFollowedVaults(followedVaults)
  }
}
