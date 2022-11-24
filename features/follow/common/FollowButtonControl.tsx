import { FollowButton } from 'features/follow/common/FollowButton'
import React, { useEffect, useState } from 'react'

export function FollowButtonControl() {
  const [isFollowing, setIsFollowing] = useState(true)
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
