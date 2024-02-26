import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import type { BaseAaveContext } from 'features/aave/types'
import React from 'react'

export function ConnectedSidebarSection(
  props: SidebarSectionProps & { context: Pick<BaseAaveContext, 'strategyConfig'> },
) {
  const strategy = props.context.strategyConfig
  return (
    <SidebarSection
      {...props}
      requireConnection={true}
      requiredChainHexId={strategy.networkHexId}
    />
  )
}
