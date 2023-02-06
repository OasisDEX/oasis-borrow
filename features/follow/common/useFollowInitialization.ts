import { useAppContext } from 'components/AppContextProvider'
import { FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE } from 'features/follow/common/followedVaultsLimitReached'
import { useEffect } from 'react'

export function useFollowInitialization({ isLimitReached }: { isLimitReached: boolean }) {
  const { uiChanges } = useAppContext()
  useEffect(() => {
    uiChanges.publish(FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE, {
      type: 'followed-vaults-limit-reached-change',
      isLimitReached,
    })
  }, [isLimitReached])
  return isLimitReached
}
