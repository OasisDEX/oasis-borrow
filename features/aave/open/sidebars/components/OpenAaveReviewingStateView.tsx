import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import {
  ConnectedSidebarSection,
  StopLossTwoTxRequirement,
  StrategyInformationContainer,
} from 'features/aave/components'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

export function OpenAaveReviewingStateView({ state, send, isLoading }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const nextStepButton = {
    steps: [state.context.currentStep, state.context.totalSteps] as [number, number],
    isLoading: isLoading(),
    disabled: isLoading() || !state.can('NEXT_STEP'),
    label: t('open-earn.aave.vault-form.confirm-btn'),
    action: () => send('NEXT_STEP'),
  }

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
        <StrategyInformationContainer
          state={state}
          changeSlippageSource={(from) => {
            send({ type: 'USE_SLIPPAGE', getSlippageFrom: from })
          }}
        />
      </Grid>
    ),
    primaryButton: nextStepButton,
    requireConnection: true,
    requiredChainHexId: state.context.strategyConfig.networkHexId,
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
