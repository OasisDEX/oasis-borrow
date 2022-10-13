import { DiscoveryNavigation } from 'features/discovery/common/DiscoveryNavigation'
import { DiscoveryWrapperWithIntro } from 'features/discovery/common/DiscoveryWrapperWithIntro'
import { DiscoveryControl } from 'features/discovery/controllers/DiscoveryControl'
import { DiscoveryPages } from 'features/discovery/types'
import React from 'react'

export function DiscoveryView({ kind }: { kind: DiscoveryPages }) {
  return (
    <DiscoveryWrapperWithIntro>
      <DiscoveryNavigation kind={kind} />
      <DiscoveryControl kind={kind} />
    </DiscoveryWrapperWithIntro>
  )
}
