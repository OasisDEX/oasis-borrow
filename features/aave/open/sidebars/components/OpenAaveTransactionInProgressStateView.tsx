import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import {
  ConnectedSidebarSection,
  StopLossTwoTxRequirement,
  StrategyInformationContainer,
} from 'features/aave/components'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { OpenVaultAnimation } from 'theme/animations'
import { Grid } from 'theme-ui'

export function OpenAaveTransactionInProgressStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()
  const { stopLossSkipped, stopLossLevel } = state.context

  const withStopLoss = stopLossLevel && !stopLossSkipped
  const resolvedTitle = !withStopLoss
    ? t(state.context.strategyConfig.viewComponents.sidebarTitle)
    : t('open-vault-two-tx-first-step-title', { type: t('position') })

  const sidebarSectionProps: SidebarSectionProps = {
    title: resolvedTitle,
    content: (
      <Grid gap={3}>
        {withStopLoss && <StopLossTwoTxRequirement typeKey="position" />}
        <OpenVaultAnimation />
        <StrategyInformationContainer
          state={state}
          changeSlippageSource={(from) => {
            send({ type: 'USE_SLIPPAGE', getSlippageFrom: from })
          }}
        />
      </Grid>
    ),
    primaryButton: {
      steps: [state.context.currentStep, state.context.totalSteps],
      isLoading: true,
      disabled: true,
      label: t('open-earn.aave.vault-form.confirm-btn'),
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
