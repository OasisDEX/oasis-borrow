import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import {
  ConnectedSidebarSection,
  OpenAaveStopLossInformation,
  StopLossTwoTxRequirement,
} from 'features/aave/components'
import { StopLossTxCompleteBanner } from 'features/aave/open/sidebars/components/StopLossTxCompleteBanner'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function StopLossTxStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()
  const { stopLossLevel, collateralActive } = state.context

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-vault-two-tx-second-step-title'),
    content: (
      <Grid gap={3}>
        <StopLossTwoTxRequirement typeKey="position" />
        <StopLossTxCompleteBanner />

        <OpenAaveStopLossInformation
          {...state.context}
          stopLossLevel={stopLossLevel!}
          collateralActive={!!collateralActive}
        />
      </Grid>
    ),
    primaryButton: {
      isLoading: false,
      disabled: false,
      action: () => {
        send('NEXT_STEP')
      },
      label: t('set-up-stop-loss-tx'),
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
