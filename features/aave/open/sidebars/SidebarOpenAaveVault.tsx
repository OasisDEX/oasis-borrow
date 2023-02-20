import { useActor } from '@xstate/react'
import { MessageCard } from 'components/MessageCard'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSectionFooterButtonSettings } from 'components/sidebar/SidebarSectionFooter'
import { isAllowanceNeeded } from 'features/aave/common/BaseAaveContext'
import { StrategyInformationContainer } from 'features/aave/common/components/informationContainer'
import { OpenAaveStopLossInformation } from 'features/aave/common/components/informationContainer/OpenAaveStopLossInformation'
import { StopLossTwoTxRequirement } from 'features/aave/common/components/StopLossTwoTxRequirement'
import { ProxyType } from 'features/aave/common/StrategyConfigTypes'
import { isUserWalletConnected } from 'features/aave/helpers/isUserWalletConnected'
import { useOpenAaveStateMachineContext } from 'features/aave/open/containers/AaveOpenStateMachineContext'
import { OpenAaveEvent, OpenAaveStateMachine } from 'features/aave/open/state'
import { getAaveStopLossData } from 'features/automation/protection/stopLoss/openFlow/openVaultStopLossAave'
import { SidebarAdjustStopLossEditingStage } from 'features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import { AllowanceView } from 'features/stateMachines/allowance'
import { CreateDPMAccountView } from 'features/stateMachines/dpmAccount/CreateDPMAccountView'
import { ProxyView } from 'features/stateMachines/proxy'
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

import { SidebarOpenAaveVaultEditingState } from './SidebarOpenAaveVaultEditingState'

function isLoading(state: StateFrom<OpenAaveStateMachine>) {
  return state.matches('background.loading')
}

export interface OpenAaveVaultProps {
  readonly aaveStateMachine: OpenAaveStateMachine
}

function CompleteBanner() {
  return (
    <Box>
      <Flex sx={{ justifyContent: 'center', mb: 4 }}>
        <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
      </Flex>
    </Box>
  )
}

interface OpenAaveStateProps {
  readonly state: StateFrom<OpenAaveStateMachine>
  readonly send: Sender<OpenAaveEvent>
  isLoading: () => boolean
}

function OpenAaveTransactionInProgressStateView({ state, send }: OpenAaveStateProps) {
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

  return <SidebarSection {...sidebarSectionProps} />
}

function StopLossTxStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()
  const { stopLossLevel, collateralActive } = state.context

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-vault-two-tx-second-step-title'),
    content: (
      <Grid gap={3}>
        <StopLossTwoTxRequirement typeKey="position" />
        <CompleteBanner />

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

  return <SidebarSection {...sidebarSectionProps} />
}

function StopLossTxFailureStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()
  const { stopLossLevel, collateralActive } = state.context

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-vault-two-tx-second-step-title'),
    content: (
      <Grid gap={3}>
        <StopLossTwoTxRequirement typeKey="position" />
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
        send('RETRY')
      },
      label: t('open-earn.aave.vault-form.retry-btn'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function StopLossInProgressStateView({ state }: OpenAaveStateProps) {
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

  return <SidebarSection {...sidebarSectionProps} />
}

function OpenAaveReviewingStateView({ state, send, isLoading }: OpenAaveStateProps) {
  const { t } = useTranslation()
  const { push } = useRedirect()

  const { stopLossSkipped, stopLossLevel } = state.context

  const withStopLoss = stopLossLevel && !stopLossSkipped
  const resolvedTitle = !withStopLoss
    ? t(state.context.strategyConfig.viewComponents.sidebarTitle)
    : t('open-vault-two-tx-first-step-title', { type: t('position') })

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
        <StrategyInformationContainer
          state={state}
          changeSlippageSource={(from) => {
            send({ type: 'USE_SLIPPAGE', getSlippageFrom: from })
          }}
        />
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
    ),
    primaryButton: {
      steps: [state.context.currentStep, state.context.totalSteps],
      ...EditingStateViewSidebarPrimaryButton({ state, send, isLoading }),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function OpenAaveSuccessStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.success-title'),
    content: (
      <Grid gap={3}>
        <CompleteBanner />
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

  return <SidebarSection {...sidebarSectionProps} />
}

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
    <SidebarSection
      {...sidebarSectionProps}
      textButton={{
        label: t('open-earn.aave.vault-form.back-to-editing'),
        action: () => send('BACK_TO_EDITING'),
      }}
    />
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
    case state.matches('frontend.txStopLoss'):
      return <StopLossTxStateView state={state} send={send} isLoading={loading} />
    case state.matches('frontend.txStopLossInProgress'):
      return <StopLossInProgressStateView state={state} send={send} isLoading={loading} />
    case state.matches('frontend.txFailure'):
      return <OpenAaveFailureStateView state={state} send={send} isLoading={loading} />
    case state.matches('frontend.stopLossTxFailure'):
      return <StopLossTxFailureStateView state={state} send={send} isLoading={loading} />
    case state.matches('frontend.txSuccess'):
      return <OpenAaveSuccessStateView state={state} send={send} isLoading={loading} />
    default: {
      return <>{JSON.stringify(state.value)}</>
    }
  }
}
