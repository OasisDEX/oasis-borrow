import { UsersWhoFollowVaults } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { LIMIT_OF_FOLLOWED_VAULTS } from 'features/automation/common/consts'
import { FollowButton } from 'features/follow/common/FollowButton'
import {
  followVaultUsingApi,
  getFollowFromApi,
  unfollowVaultUsingApi,
} from 'features/shared/followApi'
import { jwtAuthGetToken } from 'features/shared/jwt'
import React, { useEffect, useState } from 'react'
import { SxStyleProp } from 'theme-ui'

export type FollowButtonControlProps = {
  chainId: number
  followerAddress: string
  short?: boolean
  sx?: SxStyleProp
  vaultId: BigNumber
  isLimitReached: boolean
  setIsLimitReached: (value: boolean) => void
}

export function FollowButtonControl({
  chainId,
  followerAddress,
  short,
  sx,
  vaultId,
  isLimitReached,
  setIsLimitReached,
}: FollowButtonControlProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isProcessing, setProcessing] = useState(true)

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

    setIsLimitReached(followedVaults.length >= LIMIT_OF_FOLLOWED_VAULTS)
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
    console.log('isLimitReached', isLimitReached)
    console.log('isFollowing', isFollowing)
    console.log('isProcessing', isProcessing)
    console.log('vaultId', vaultId)
  }
  return (
    <FollowButton
      isProcessing={isProcessing}
      isFollowing={isFollowing}
      isLimitReached={isLimitReached}
      buttonClickHandler={buttonClickHandler}
      short={short}
      sx={sx}
    />
  )

  async function unfollowVault(jwtToken: string) {
    console.log('unfollowing vault')
    await unfollowVaultUsingApi(vaultId, chainId, jwtToken)
    setIsFollowing(false)
    setProcessing(false)
    setIsLimitReached(false)
  }

  async function followVault(jwtToken: string) {
    const followedVaults = await followVaultUsingApi(vaultId, chainId, jwtToken)

    handleGetFollowedVaults(followedVaults)
    // setIsFollowing(true)
  }
}
