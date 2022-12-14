import BigNumber from 'bignumber.js'
import { FollowButton } from 'features/follow/common/FollowButton'
import { followVaultUsingApi$ } from 'features/shared/followApi'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import React, { useEffect, useState } from 'react'

export type FollowButtonProps = {
  followerAddress: string
  vaultId: BigNumber
  docVersion: string
  chainId: number
}

export function FollowButtonControl({
  followerAddress,
  vaultId,
  docVersion,
  chainId,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isProcessing, setProcessing] = useState(true)
  //   TODO ŁW - Error handling when working with real api

  useEffect(() => {
    setTimeout(() => {
      setIsFollowing(false)
      setProcessing(false)
    }, 1000)
    setProcessing(isProcessing)
  }, [])
  function buttonClickHandler() {
    console.log('followerAddress')
    console.log(followerAddress)
    const jwtToken = jwtAuthGetToken(followerAddress)
    console.log('jwtToken')
    console.log(jwtToken)
    if (vaultId && jwtToken) {
      console.log('follow using api')
      followVaultUsingApi$(vaultId, followerAddress, docVersion, chainId, jwtToken)
    }
    if (!isProcessing) {
      setProcessing(true)
    }
  }
  return (
    <FollowButton
      isProcessing={isProcessing}
      isFollowing={isFollowing}
      buttonClickHandler={buttonClickHandler}
    />
  )
}
