import type { Protocol, UsersWhoFollowVaults } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { LIMIT_OF_FOLLOWED_VAULTS } from 'features/follow/common/consts'
import type { FollowedVaultsLimitReachedChange } from 'features/follow/common/followedVaultsLimitReached'
import { FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE } from 'features/follow/common/followedVaultsLimitReached'
import { FollowButton } from 'features/follow/view/FollowButton'
import { accountIsConnectedValidator } from 'features/form/commonValidators'
import {
  followVaultUsingApi,
  getFollowFromApi,
  unfollowVaultUsingApi,
} from 'features/shared/followApi'
import { jwtAuthGetToken } from 'features/shared/jwt'
import { uiChanges } from 'helpers/uiChanges'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useEffect, useState } from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'

export type FollowButtonControlProps = {
  chainId: number
  followerAddress: string
  short?: boolean
  sx?: ThemeUIStyleObject
  vaultId: BigNumber
  protocol: Protocol
}

export function FollowButtonControl({
  chainId,
  followerAddress,
  short,
  sx,
  vaultId,
  protocol,
}: FollowButtonControlProps) {
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
  const isWalletConnected = accountIsConnectedValidator({ account: followerAddress })
  async function unfollowVault(jwtToken: string) {
    try {
      await unfollowVaultUsingApi(vaultId, chainId, protocol, jwtToken)
      setIsFollowing(false)
    } catch (e) {
      console.error(e)
    }
    setProcessing(false)
    uiChanges.publish(FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE, {
      type: 'followed-vaults-limit-reached-change',
      isLimitReached: false,
    })
  }

  async function followVault(jwtToken: string) {
    try {
      const followedVaults = await followVaultUsingApi(vaultId, chainId, protocol, jwtToken)
      handleGetFollowedVaults(followedVaults)
      setIsFollowing(true)
    } catch (e) {
      console.error(e)
    }
  }
  return (
    <FollowButton
      isProcessing={isProcessing}
      isFollowing={isFollowing}
      buttonClickHandler={buttonClickHandler}
      short={short}
      sx={sx}
      isLimitReached={isLimitReachedState?.isLimitReached || false}
      isWalletConnected={isWalletConnected}
    />
  )
}
