import { useActor } from '@xstate/react'
import { NetworkIds } from 'blockchain/networks'
import { MessageCard } from 'components/MessageCard'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import type { SidebarSectionFooterButtonSettings } from 'components/sidebar/SidebarSectionFooter'
import {
  ConnectedSidebarSection,
  ErrorMessageCannotDepositDueToProtocolCap,
  OpenAaveStopLossInformation,
  StopLossTwoTxRequirement,
  StrategyInformationContainer,
} from 'features/aave/components'
import { hasUserInteracted } from 'features/aave/helpers'
import { supportsAaveStopLoss } from 'features/aave/helpers/supportsAaveStopLoss'
import { useOpenAaveStateMachineContext } from 'features/aave/open/containers/AaveOpenStateMachineContext'
import type { OpenAaveEvent, OpenAaveStateMachine } from 'features/aave/open/state'
import { isAllowanceNeeded, ProductType, ProxyType } from 'features/aave/types'
import { isSupportedAaveAutomationTokenPair } from 'features/automation/common/helpers/isSupportedAaveAutomationTokenPair'
import { getAaveStopLossData } from 'features/automation/protection/stopLoss/openFlow/openVaultStopLossAave'
import { SidebarAdjustStopLossEditingStage } from 'features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import { AllowanceView } from 'features/stateMachines/allowance'
import { CreateDPMAccountView } from 'features/stateMachines/dpmAccount/CreateDPMAccountView'
import { ProxyView } from 'features/stateMachines/proxy'
import { getLocalAppConfig, useAppConfig } from 'helpers/config'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { AddingStopLossAnimation, OpenVaultAnimation } from 'theme/animations'
import { Box, Flex, Grid, Image } from 'theme-ui'
import type { FeaturesEnum } from 'types/config'
import type { Sender, StateFrom } from 'xstate'

import { SidebarOpenAaveVaultEditingState } from './SidebarOpenAaveVaultEditingState'

function getLambdaProtectionFlag(networkId: NetworkIds, features: Record<FeaturesEnum, boolean>) {
  const {
    AaveV3ProtectionLambdaArbitrum,
    AaveV3ProtectionLambdaBase,
    AaveV3ProtectionLambdaEthereum,
    AaveV3ProtectionLambdaOptimism,
  } = features

  switch (networkId) {
    case NetworkIds.OPTIMISMMAINNET:
      return AaveV3ProtectionLambdaOptimism
    case NetworkIds.ARBITRUMMAINNET:
      return AaveV3ProtectionLambdaArbitrum
    case NetworkIds.MAINNET:
      return AaveV3ProtectionLambdaEthereum
    case NetworkIds.BASEMAINNET:
      return AaveV3ProtectionLambdaBase
    default:
      return false
  }
}

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

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
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

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
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

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
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

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}

function OpenAaveReviewingStateView({ state, send, isLoading }: OpenAaveStateProps) {
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

function OpenAaveEditingStateView({ state, send, isLoading }: OpenAaveStateProps) {
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

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}

export function AaveOpenPositionStopLossLambda(_props: OpenAaveStateProps) {
  return <div>new stop loss sidebar</div>
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

export function SidebarOpenAaveVault() {
  const { stateMachine } = useOpenAaveStateMachineContext()
  const [state, send] = useActor(stateMachine)
  const lambdaProtectionFlag = getLambdaProtectionFlag(
    state.context.strategyConfig.networkId,
    getLocalAppConfig('features'),
  )

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
      return lambdaProtectionFlag ? (
        <AaveOpenPositionStopLossLambda state={state} send={send} isLoading={loading} />
      ) : (
        <AaveOpenPositionStopLoss state={state} send={send} isLoading={loading} />
      )
    case state.matches('frontend.reviewing'):
      return <OpenAaveReviewingStateView state={state} send={send} isLoading={loading} />
    case state.matches('frontend.txInProgress'):
    case state.matches('frontend.txInProgressEthers'):
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
    case state.matches('frontend.savePositionToDb'):
    case state.matches('frontend.finalized'):
      return <OpenAaveSuccessStateView state={state} send={send} isLoading={loading} />
    default: {
      return <>{JSON.stringify(state.value)}</>
    }
  }
}
