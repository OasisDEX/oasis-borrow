import { useFollowInitialization } from 'features/follow/common/useFollowInitialization'
import type { WithChildren } from 'helpers/types/With.types'

export function WithFollowVaults({ children }: WithChildren) {
  useFollowInitialization({ isLimitReached: false })

  return children
}
