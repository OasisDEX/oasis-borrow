import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

import type { MigrateAaveStateProps } from './migrateAaveStateProps'

export function MigrateAaveFailureStateView({ state, send }: MigrateAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('migrate.vault-form.title'),
    content: <Grid gap={3}></Grid>,
    primaryButton: {
      isLoading: false,
      disabled: false,
      label: t('migrate.retry'),
      action: () => send({ type: 'RETRY' }),
    },
  }

  return (
    <ConnectedSidebarSection
      {...sidebarSectionProps}
      textButton={{
        label: t('open-earn.aave.vault-form.back-to-editing'),
        action: () => send('BACK_TO_EDITING'),
      }}
      context={state.context}
    />
  )
}
