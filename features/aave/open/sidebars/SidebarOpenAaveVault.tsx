import { useActor } from '@xstate/react'
import { MessageCard } from 'components/MessageCard'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSectionFooterButtonSettings } from 'components/sidebar/SidebarSectionFooter'
import { isUserWalletConnected } from 'features/aave/helpers/isUserWalletConnected'
import { AutomationContextInput } from 'features/automation/contexts/AutomationContextInput'
import { getAaveStopLossData } from 'features/automation/protection/stopLoss/openFlow/openVaultStopLossAave'
import { SidebarAdjustStopLossEditingStage } from 'features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { getCustomNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useRedirect } from 'helpers/useRedirect'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Image } from 'theme-ui'
import { AddingStopLossAnimation, OpenVaultAnimation } from 'theme/animations'
import { Sender, StateFrom } from 'xstate'

import { AllowanceView } from '../../../stateMachines/allowance'
import { CreateDPMAccountView } from '../../../stateMachines/dpmAccount/CreateDPMAccountView'
import { ProxyView } from '../../../stateMachines/proxy'
import { isAllowanceNeeded } from '../../common/BaseAaveContext'
import { StrategyInformationContainer } from '../../common/components/informationContainer'
import { ProxyType } from '../../common/StrategyConfigTypes'
import { useOpenAaveStateMachineContext } from '../containers/AaveOpenStateMachineContext'
import { OpenAaveEvent, OpenAaveStateMachine } from '../state'
import { SidebarOpenAaveVaultEditingState } from './SidebarOpenAaveVaultEditingState'

function isLoading(state: StateFrom<OpenAaveStateMachine>) {
  return state.matches('background.loading')
}

export interface OpenAaveVaultProps {
  readonly aaveStateMachine: OpenAaveStateMachine
}

interface OpenAaveStateProps {
  readonly state: StateFrom<OpenAaveStateMachine>
  readonly send: Sender<OpenAaveEvent>
  isLoading: () => boolean
}

function OpenAaveTransactionInProgressStateView({ state }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(state.context.strategyConfig.viewComponents.sidebarTitle),
    content: (
      <Grid gap={3}>
        <OpenVaultAnimation />
        <StrategyInformationContainer state={state} />
      </Grid>
    ),
    primaryButton: {
      steps: [state.context.currentStep, state.context.totalSteps],
      isLoading: true,
      disabled: true,
      label: t('open-earn.aave.vault-form.confirm-btn'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function StopLossInProgressStateView({ state }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(state.context.strategyConfig.viewComponents.sidebarTitle),
    content: (
      <Grid gap={3}>
        <AddingStopLossAnimation />
        <StrategyInformationContainer state={state} />
      </Grid>
    ),
    primaryButton: {
      steps: [state.context.currentStep, state.context.totalSteps],
      isLoading: true,
      disabled: true,
      label: t('set-up-stop-loss-tx'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

export const MemoizedStopLossInProgressStateView = React.memo(StopLossInProgressStateView)

function OpenAaveReviewingStateView({ state, send, isLoading }: OpenAaveStateProps) {
  const { t } = useTranslation()
  const { push } = useRedirect()

  const primaryButton = !isUserWalletConnected(state.context)
    ? {
        label: t('connect-wallet'),
        action: () => {
          void push(`/connect`, getCustomNetworkParameter())
        },
        steps: undefined,
      }
    : {
        steps: [state.context.currentStep, state.context.totalSteps] as [number, number],
        isLoading: isLoading(),
        disabled: !state.can('NEXT_STEP'),
        label: t('open-earn.aave.vault-form.confirm-btn'),
        action: () => send('NEXT_STEP'),
      }

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(state.context.strategyConfig.viewComponents.sidebarTitle),
    content: (
      <Grid gap={3}>
        <StrategyInformationContainer state={state} />
      </Grid>
    ),
    primaryButton,
  }

  return (
    <SidebarSection
      {...sidebarSectionProps}
      textButton={{
        label: t('open-earn.aave.vault-form.back-to-editing'),
        action: () => send('BACK_TO_EDITING'),
      }}
    />
  )
}

function OpenAaveFailureStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(state.context.strategyConfig.viewComponents.sidebarTitle),
    content: (
      <Grid gap={3}>
        <StrategyInformationContainer state={state} />
      </Grid>
    ),
    primaryButton: {
      isLoading: false,
      disabled: false,
      label: t('open-earn.aave.vault-form.retry-btn'),
      action: () => send({ type: 'RETRY' }),
    },
  }

  return (
    <SidebarSection
      {...sidebarSectionProps}
      textButton={{
        label: t('open-earn.aave.vault-form.back-to-editing'),
        action: () => send('BACK_TO_EDITING'),
      }}
    />
  )
}

function EditingStateViewSidebarPrimaryButton({
  state,
  send,
  isLoading,
}: OpenAaveStateProps): Pick<
  SidebarSectionFooterButtonSettings,
  'isLoading' | 'disabled' | 'label' | 'action' | 'steps'
> {
  const { t } = useTranslation()
  const { push } = useRedirect()

  if (!isUserWalletConnected(state.context)) {
    return {
      label: t('connect-wallet'),
      action: () => {
        void push(`/connect`, getCustomNetworkParameter())
      },
      steps: undefined,
    }
  }

  const hasProxy =
    state.context.strategyConfig.proxyType === ProxyType.DpmProxy
      ? state.context.userDpmAccount !== undefined
      : state.context.connectedProxyAddress !== undefined

  const allowanceNeeded = isAllowanceNeeded(state.context)

  const label = hasProxy
    ? allowanceNeeded
      ? t('set-allowance-for', { token: state.context.strategyConfig.tokens.deposit })
      : t(state.context.strategyConfig.viewComponents.sidebarButton)
    : t('dpm.create-flow.welcome-screen.create-button')

  const isProxyCreationDisabled = useFeatureToggle('ProxyCreationDisabled')

  return {
    isLoading: isLoading(),
    disabled: !state.can('NEXT_STEP') || (!hasProxy && isProxyCreationDisabled),
    label,
    action: () => send('NEXT_STEP'),
  }
}

function OpenAaveEditingStateView({ state, send, isLoading }: OpenAaveStateProps) {
  const { t } = useTranslation()
  const { hasOpenedPosition } = state.context
  const AdjustRiskView = state.context.strategyConfig.viewComponents.adjustRiskView

  const amountTooHigh =
    state.context.userInput.amount?.gt(state.context.tokenBalance || zero) ?? false

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(state.context.strategyConfig.viewComponents.sidebarTitle),
    content: (
      <WithLoadingIndicator
        // this loader seems to be pointless, but undefined tokenUsdPrice (below) breaks the proper decimals input so it needs to be there
        value={[state.context.collateralPrice]}
        customLoader={
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <AppSpinner size={24} />
          </Box>
        }
      >
        {() => (
          <Grid gap={3}>
            <SidebarOpenAaveVaultEditingState state={state} send={send} />
            {state.context.tokenBalance && amountTooHigh && (
              <MessageCard
                messages={[t('vault-errors.deposit-amount-exceeds-collateral-balance')]}
                type="error"
              />
            )}
            <AdjustRiskView
              title={
                state.context.strategyConfig.type === 'Earn'
                  ? t('sidebar-titles.open-earn-position')
                  : t('sidebar-titles.open-multiply-position')
              }
              state={state}
              send={send}
              isLoading={isLoading}
              primaryButton={{
                steps: [state.context.currentStep, state.context.totalSteps],
                isLoading: isLoading(),
                disabled: !state.can('NEXT_STEP'),
                label: t(state.context.strategyConfig.viewComponents.sidebarButton),
                action: () => send('NEXT_STEP'),
              }}
              textButton={{
                label: t('open-earn.aave.vault-form.back-to-editing'),
                action: () => send('BACK_TO_EDITING'),
              }}
              viewLocked={hasOpenedPosition}
              showWarring={hasOpenedPosition}
              noSidebar
            />
          </Grid>
        )}
      </WithLoadingIndicator>
    ),
    primaryButton: {
      steps: [state.context.currentStep, state.context.totalSteps],
      ...EditingStateViewSidebarPrimaryButton({ state, send, isLoading }),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function OpenAaveSuccessStateView({ state }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.success-title'),
    content: (
      <Grid gap={3}>
        <Box>
          <Flex sx={{ justifyContent: 'center', mb: 4 }}>
            <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
          </Flex>
        </Box>
        <StrategyInformationContainer state={state} />
      </Grid>
    ),
    primaryButton: {
      label: t('open-earn.aave.vault-form.go-to-position'),
      url: state.context.positionRelativeAddress,
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

export function AaveOpenPositionStopLoss({ state, send, isLoading }: OpenAaveStateProps) {
  const { t } = useTranslation()
  const { stopLossSidebarProps, automationContextProps } = getAaveStopLossData(state.context, send)

  console.log('stopLossSidebarProps', stopLossSidebarProps)
  console.log('automationContextProps', automationContextProps)

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
      disabled: !state.can('NEXT_STEP'),
      label: t('open-earn.aave.vault-form.confirm-btn'),
      action: () => send('NEXT_STEP'),
    },
    headerButton: {
      label: t('protection.continue-without-stop-loss'),
      action: () => send({ type: 'SET_STOP_LOSS_SKIPPED', stopLossSkipped: true }),
    },
  }

  return (
    <AutomationContextInput {...automationContextProps}>
      <SidebarSection
        {...sidebarSectionProps}
        textButton={{
          label: t('open-earn.aave.vault-form.back-to-editing'),
          action: () => send('BACK_TO_EDITING'),
        }}
      />
    </AutomationContextInput>
  )
}

export function SidebarOpenAaveVault() {
  const { stateMachine } = useOpenAaveStateMachineContext()
  const [state, send] = useActor(stateMachine)

  function loading(): boolean {
    return isLoading(state)
  }

  switch (true) {
    case state.matches('frontend.editing'):
      return <OpenAaveEditingStateView state={state} send={send} isLoading={loading} />
    case state.matches('frontend.dsProxyCreating'):
      return (
        <ProxyView
          proxyMachine={state.context.refProxyMachine!}
          steps={[state.context.currentStep, state.context.totalSteps]}
        />
      )
    case state.matches('frontend.dpmProxyCreating'):
      return <CreateDPMAccountView machine={state.context.refDpmAccountMachine!} />
    case state.matches('frontend.allowanceSetting'):
      return (
        <AllowanceView
          allowanceMachine={state.context.refAllowanceStateMachine!}
          steps={[state.context.currentStep, state.context.totalSteps]}
        />
      )
    case state.matches('frontend.optionalStopLoss'):
      return <AaveOpenPositionStopLoss state={state} send={send} isLoading={loading} />
    case state.matches('frontend.reviewing'):
      return <OpenAaveReviewingStateView state={state} send={send} isLoading={loading} />
    case state.matches('frontend.txInProgress'):
      return (
        <OpenAaveTransactionInProgressStateView state={state} send={send} isLoading={loading} />
      )
    case state.matches('frontend.txStopLossInProgress'):
      return <MemoizedStopLossInProgressStateView state={state} send={send} isLoading={loading} />
    case state.matches('frontend.txFailure'):
      return <OpenAaveFailureStateView state={state} send={send} isLoading={loading} />
    case state.matches('frontend.txSuccess'):
      return <OpenAaveSuccessStateView state={state} send={send} isLoading={loading} />
    default: {
      return <>{JSON.stringify(state.value)}</>
    }
  }
}
