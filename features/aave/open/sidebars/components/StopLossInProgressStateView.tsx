import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import {
  ConnectedSidebarSection,
  OpenAaveStopLossInformation,
  StopLossTwoTxRequirement,
} from 'features/aave/components'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { AddingStopLossAnimation } from 'theme/animations'
import { Grid } from 'theme-ui'

export function StopLossInProgressStateView({ state }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-vault-two-tx-second-step-title'),
    content: (
      <Grid gap={3}>
        <StopLossTwoTxRequirement typeKey="position" />
        <AddingStopLossAnimation />
        <OpenAaveStopLossInformation
          {...state.context}
          stopLossLevel={state.context.stopLossLevel!}
          collateralActive={!!state.context.collateralActive}
        />
      </Grid>
    ),
    primaryButton: {
      isLoading: true,
      disabled: true,
      label: t('set-up-stop-loss-tx'),
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
