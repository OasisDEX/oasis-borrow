import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Text } from 'theme-ui'

import type { MigrateAaveStateProps } from './migrateAaveStateProps'

export function MigrateAllowanceFailureStateView({ state, send }: MigrateAaveStateProps) {
  const { t } = useTranslation()

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
      isLoading: false,
      disabled: false,
      label: t('migrate.retry'),
      action: () => send({ type: 'RETRY' }),
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
