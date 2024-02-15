import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import { getAaveStopLossData } from 'features/automation/protection/stopLoss/openFlow/openVaultStopLossAave'
import { SidebarAdjustStopLossEditingStage } from 'features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid } from 'theme-ui'

export function AaveOpenPositionStopLoss({ state, send, isLoading }: OpenAaveStateProps) {
  const { t } = useTranslation()
  const { stopLossSidebarProps } = getAaveStopLossData(state.context, send)

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(state.context.strategyConfig.viewComponents.sidebarTitle),
    content: (
      <Grid gap={3}>
        <SidebarAdjustStopLossEditingStage {...stopLossSidebarProps} />
      </Grid>
    ),
    primaryButton: {
      steps: [state.context.currentStep, state.context.totalSteps],
      isLoading: isLoading(),
      disabled: isLoading() || !state.can('NEXT_STEP'),
      label: t('open-earn.aave.vault-form.confirm-btn'),
      action: () => send('NEXT_STEP'),
    },
    headerButton: {
      label: t('protection.continue-without-stop-loss'),
      action: () => send({ type: 'SET_STOP_LOSS_SKIPPED', stopLossSkipped: true }),
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
