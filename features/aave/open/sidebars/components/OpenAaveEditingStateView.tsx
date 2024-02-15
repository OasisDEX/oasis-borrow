import { MessageCard } from 'components/MessageCard'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import type { SidebarSectionFooterButtonSettings } from 'components/sidebar/SidebarSectionFooter'
import {
  ConnectedSidebarSection,
  ErrorMessageCannotDepositDueToProtocolCap,
  StrategyInformationContainer,
} from 'features/aave/components'
import { hasUserInteracted } from 'features/aave/helpers'
import { supportsAaveStopLoss } from 'features/aave/helpers/supportsAaveStopLoss'
import { SidebarOpenAaveVaultEditingState } from 'features/aave/open/sidebars/components/SidebarOpenAaveVaultEditingState'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import { isAllowanceNeeded, ProductType, ProxyType } from 'features/aave/types'
import { isSupportedAaveAutomationTokenPair } from 'features/automation/common/helpers/isSupportedAaveAutomationTokenPair'
import { useAppConfig } from 'helpers/config'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

function EditingStateViewSidebarPrimaryButton({
  state,
  send,
  isLoading,
}: OpenAaveStateProps): Pick<
  SidebarSectionFooterButtonSettings,
  'isLoading' | 'disabled' | 'label' | 'action' | 'steps'
> {
  const { t } = useTranslation()

  const { ProxyCreationDisabled: isProxyCreationDisabled } = useAppConfig('features')

  const hasProxy =
    state.context.strategyConfig.proxyType === ProxyType.DpmProxy
      ? state.context.userDpmAccount !== undefined
      : state.context.connectedProxyAddress !== undefined

  const allowanceNeeded = isAllowanceNeeded(state.context)
  const isSettingStopLoss =
    !state.context.stopLossSkipped &&
    supportsAaveStopLoss(
      state.context.strategyConfig.protocol,
      state.context.strategyConfig.networkId,
    ) &&
    isSupportedAaveAutomationTokenPair(
      state.context.strategyConfig.tokens.collateral,
      state.context.strategyConfig.tokens.debt,
    ) &&
    state.context.strategyConfig.type === ProductType.Multiply

  function getLabel() {
    if (!hasProxy) {
      return t('dpm.create-flow.welcome-screen.create-button')
    }
    if (allowanceNeeded) {
      return t('set-allowance-for', { token: state.context.strategyConfig.tokens.deposit })
    }
    if (isSettingStopLoss) {
      return t('setup-stop-loss')
    }
    return t(state.context.strategyConfig.viewComponents.sidebarButton)
  }

  const label = getLabel()

  return {
    isLoading: isLoading(),
    disabled: isLoading() || !state.can('NEXT_STEP') || (!hasProxy && isProxyCreationDisabled),
    label,
    action: () => send('NEXT_STEP'),
  }
}

export function OpenAaveEditingStateView({ state, send, isLoading }: OpenAaveStateProps) {
  const { t } = useTranslation()
  const { hasOpenedPosition } = state.context
  const SecondaryInputComponent = state.context.strategyConfig.viewComponents.secondaryInput

  const amountTooHigh =
    state.context.userInput.amount?.gt(state.context.tokenBalance || zero) ?? false

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(state.context.strategyConfig.viewComponents.sidebarTitle),
    content: (
      <Grid gap={3}>
        <SidebarOpenAaveVaultEditingState state={state} send={send} />
        {state.context.tokenBalance && amountTooHigh && (
          <MessageCard
            messages={[t('aave.errors.deposit-amount-exceeds-collateral-balance')]}
            type="error"
            withBullet={false}
          />
        )}
        <ErrorMessageCannotDepositDueToProtocolCap context={state.context} />
        <SecondaryInputComponent
          state={state}
          send={send}
          isLoading={isLoading}
          viewLocked={hasOpenedPosition}
          showWarning={hasOpenedPosition}
        />
        {hasUserInteracted(state) && (
          <StrategyInformationContainer
            state={state}
            changeSlippageSource={(from) => {
              send({ type: 'USE_SLIPPAGE', getSlippageFrom: from })
            }}
          />
        )}
      </Grid>
    ),
    primaryButton: {
      steps: [state.context.currentStep, state.context.totalSteps],
      ...EditingStateViewSidebarPrimaryButton({ state, send, isLoading }),
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}
