import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection, StrategyInformationContainer } from 'features/aave/components'
import { StopLossTxCompleteBanner } from 'features/aave/open/sidebars/components/StopLossTxCompleteBanner'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function OpenAaveSuccessStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.success-title'),
    content: (
      <Grid gap={3}>
        <StopLossTxCompleteBanner />
        <StrategyInformationContainer
          state={state}
          changeSlippageSource={(from) => {
            send({ type: 'USE_SLIPPAGE', getSlippageFrom: from })
          }}
        />
      </Grid>
    ),
    primaryButton: {
      label: t('open-earn.aave.vault-form.go-to-position'),
      url: state.context.positionRelativeAddress,
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
