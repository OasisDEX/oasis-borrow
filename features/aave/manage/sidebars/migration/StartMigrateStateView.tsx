import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

import type { MigrateAaveStateProps } from './migrateAaveStateProps'

export function MigrateStateView({ state, send, isLoading }: MigrateAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('migrate.vault-form.title'),
    content: <Grid gap={3}>yoasd</Grid>,
    primaryButton: {
      isLoading: isLoading(),
      disabled: isLoading() || !state.can('NEXT_STEP'),
      label: t('migrate.start-tx'),
      action: () => send('NEXT_STEP'),
    },
    requireConnection: true,
    requiredChainHexId: state.context.strategyConfig.networkHexId,
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
