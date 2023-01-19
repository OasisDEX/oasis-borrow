import { UsersWhoFollowVaults } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { FollowButton } from 'features/follow/common/FollowButton'
import {
  followVaultUsingApi,
  getFollowFromApi,
  unfollowVaultUsingApi,
} from 'features/shared/followApi'
import { jwtAuthGetToken } from 'features/shared/jwt'
import React, { useEffect, useState } from 'react'

export type FollowButtonProps = {
  followerAddress: string
  vaultId: BigNumber
  docVersion: string
  chainId: number
}

export function FollowButtonControl({ followerAddress, vaultId, chainId }: FollowButtonProps) {
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
      buttonClickHandler={buttonClickHandler}
    />
  )

  async function unfollowVault(jwtToken: string) {
    await unfollowVaultUsingApi(vaultId, chainId, jwtToken)
    setIsFollowing(false)
    setProcessing(false)
  }

  async function followVault(jwtToken: string) {
    const followedVaults = await followVaultUsingApi(vaultId, chainId, jwtToken)

    handleGetFollowedVaults(followedVaults)
    setIsFollowing(true)
  }
}
