import { FollowButton } from 'features/follow/common/FollowButton'
import { useEffect, useState } from 'react'

export function FollowButtonControl() {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isProcessing, setProcessing] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setIsFollowing(true)
      setProcessing(false)
    }, 5000)
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
