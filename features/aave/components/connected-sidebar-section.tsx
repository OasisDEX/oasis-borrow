import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { BaseAaveContext } from 'features/aave/types'
import React from 'react'

export function ConnectedSidebarSection(props: SidebarSectionProps & { context: BaseAaveContext }) {
  const strategy = props.context.strategyConfig
  return (
    <SidebarSection
      {...props}
      requireConnection={true}
      requiredChainHexId={strategy.networkHexId}
    />
  )
}
