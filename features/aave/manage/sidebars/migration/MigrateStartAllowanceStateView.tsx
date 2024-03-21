import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Text } from 'theme-ui'

import type { MigrateAaveStateProps } from './migrateAaveStateProps'

export function MigrateStartAllowanceStateView({ state, send, isLoading }: MigrateAaveStateProps) {
  const { t } = useTranslation()

  const loading = isLoading()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('migrate.allowance-form.title'),
    content: (
      <Grid gap={3}>
        <Text variant="paragraph3" sx={{ color: 'neutral80', lineHeight: '22px' }}>
          {t('migrate.allowance-form.description')}
        </Text>
      </Grid>
    ),
    primaryButton: {
      isLoading: loading,
      disabled: loading || !state.can('NEXT_STEP'),
      label: t('approve-allowance'),
      action: () => send('NEXT_STEP'),
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
