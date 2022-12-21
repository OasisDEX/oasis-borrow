import { UsersWhoFollowVaults } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { FollowButton } from 'features/follow/common/FollowButton'
import { followVaultUsingApi, getFollowFromApi } from 'features/shared/followApi'
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
  // const getFollowedVaults$ = useMemo(() => getFollowFromApi(followerAddress), [followerAddress])
  // const [getFollowFromApi] = useObservable(getFollowedVaults$)

  // const currentFollowedVault = getFollowFromApi?.find((item) =>
  //   new BigNumber(item.vault_id).eq(vaultId),
  // )
  const [isFollowing, setIsFollowing] = useState(false)
  const [isProcessing, setProcessing] = useState(true)
  //   TODO ŁW - Error handling when working with real api

  console.log('isProcessing', isProcessing)
  useEffect(() => {
    console.log('followerAddress')
    console.log(followerAddress)
    void getFollowFromApi(followerAddress)
      .then((resp) => {
        handleGetFollowedVaults(resp)
      })
      .finally(() => {
        setProcessing(false)
      })
  }, [])

  function handleGetFollowedVaults(resp: UsersWhoFollowVaults[]) {
    console.log('inside handleGetFollowedVaults')
    const followedVaults = Object.values(resp)
    console.log(followedVaults)
    console.log(followedVaults)
    const currentFollowedVault = followedVaults.find((item) =>
      new BigNumber(item.vault_id).eq(vaultId),
    )
    setIsFollowing(currentFollowedVault !== undefined)
    setProcessing(false) // this is required finally doesn't handle it!
  }

  async function buttonClickHandler() {
    setProcessing(true)
    const jwtToken = jwtAuthGetToken(followerAddress)
    if (vaultId && jwtToken) {
      // this observable is causing race condition, rewrite using async await, fetch - timeout proofs that observable causes the problem
      // followVaultUsingApi$(vaultId, followerAddress, docVersion, chainId, jwtToken).subscribe()
      const followedVaults = await followVaultUsingApi(
        vaultId,
        followerAddress,
        docVersion,
        chainId,
        jwtToken,
      )
      console.log('return from post')
      console.log(followedVaults)
      // TODO Ł this post is ok, but now rewrite method to also return all followed vaults so I won't need to do get request afterwards ~Ł
      // const followedVault = await getFollowFromApi(followerAddress)
      handleGetFollowedVaults(followedVaults)
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
