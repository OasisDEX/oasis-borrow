import { useFollowInitialization } from 'features/follow/common/useFollowInitialization'
import { WithChildren } from 'helpers/types'
import { useFeatureToggle } from 'helpers/useFeatureToggle'

export function WithFollowVaults({ children }: WithChildren) {
  const followVaultsEnabled = useFeatureToggle('FollowVaults')
  if (followVaultsEnabled) {
    useFollowInitialization({ isLimitReached: false })
  }
  return children
}
