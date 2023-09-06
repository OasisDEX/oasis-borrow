import { FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE } from 'features/follow/common/followedVaultsLimitReached'
import { uiChanges } from 'helpers/uiChanges'
import { useEffect } from 'react'

export function useFollowInitialization({ isLimitReached }: { isLimitReached: boolean }) {
  useEffect(() => {
    uiChanges.publish(FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE, {
      type: 'followed-vaults-limit-reached-change',
      isLimitReached,
    })
  }, [isLimitReached])

  return isLimitReached
}
