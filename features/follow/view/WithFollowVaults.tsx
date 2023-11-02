import { useFollowInitialization } from 'features/follow/common/useFollowInitialization'
import React, { type PropsWithChildren } from 'react'

export function WithFollowVaults({ children }: PropsWithChildren<{}>) {
  useFollowInitialization({ isLimitReached: false })

  return <>{children}</>
}
