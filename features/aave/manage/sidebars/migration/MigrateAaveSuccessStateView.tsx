import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

import type { MigrateAaveStateProps } from './migrateAaveStateProps'

export function MigrateAaveSuccessStateView({ state }: MigrateAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('migrate.vault-form.success-title'),
    content: <Grid gap={3}></Grid>,
    primaryButton: {
      label: t('migrate.go-to-position'),
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
