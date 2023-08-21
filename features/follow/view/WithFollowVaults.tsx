import { useFollowInitialization } from 'features/follow/common/useFollowInitialization'
import { WithChildren } from 'helpers/types'

export function WithFollowVaults({ children }: WithChildren) {
  useFollowInitialization({ isLimitReached: false })

  return children
}
