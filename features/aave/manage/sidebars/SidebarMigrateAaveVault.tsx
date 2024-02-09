import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import type { ManageAaveStateMachineState } from 'features/aave/manage/state'
import React from 'react'
import { OpenVaultAnimation } from 'theme/animations'
import { Grid } from 'theme-ui'

export function SidebarMigrateAaveVault({ state }: { state: ManageAaveStateMachineState }) {
  const sidebarSectionProps: SidebarSectionProps = {
    title: 'Migrate',
    content: (
      <Grid gap={3}>
        <OpenVaultAnimation />
      </Grid>
    ),
    primaryButton: {
      isLoading: true,
      disabled: true,
      label: 'Start Migration',
      action: () => {},
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
