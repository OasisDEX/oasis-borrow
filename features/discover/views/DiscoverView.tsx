import { DiscoverNavigation } from 'features/discover/common/DiscoverNavigation'
import { DiscoverWrapperWithIntro } from 'features/discover/common/DiscoverWrapperWithIntro'
import { DiscoverControl } from 'features/discover/controllers/DiscoverControl'
import { DiscoverPages } from 'features/discover/types'
import React from 'react'

export function DiscoverView({ kind }: { kind: DiscoverPages }) {
  return (
    <DiscoverWrapperWithIntro key={kind}>
      <DiscoverNavigation kind={kind} />
      <DiscoverControl kind={kind} />
    </DiscoverWrapperWithIntro>
  )
}
