import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { OpenVaultAnimation } from 'theme/animations'
import { Grid } from 'theme-ui'

import type { MigrateAaveStateProps } from './migrateAaveStateProps'

export function MigrateAllowanceInProgressStateView({ state }: MigrateAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('migrate.allowance-form.title'),
    content: (
      <Grid gap={3}>
        <OpenVaultAnimation />
      </Grid>
    ),
    primaryButton: {
      isLoading: true,
      disabled: true,
      label: t('approving-allowance'),
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
