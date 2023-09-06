import { useEffect } from 'react'
import { FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE } from 'features/follow/common/followedVaultsLimitReached'
import { uiChanges } from 'helpers/uiChanges'

export function useFollowInitialization({ isLimitReached }: { isLimitReached: boolean }) {
  useEffect(() => {
    uiChanges.publish(FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE, {
      type: 'followed-vaults-limit-reached-change',
      isLimitReached,
    })
  }, [isLimitReached])

  return isLimitReached
}
