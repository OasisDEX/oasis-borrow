import { useActor } from '@xstate/react'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Image } from 'theme-ui'
import { Sender } from 'xstate'

import { staticFilesRuntimeUrl } from '../../../../../helpers/staticPaths'
import { OpenVaultAnimation } from '../../../../../theme/animations'
import { ProxyView } from '../../../../proxyNew'
import { OpenAaveInformationContainer } from '../../common/components/OpenAaveInformationContainer'
import { AdjustRiskView } from '../../common/components/SidebarAdjustRiskView'
import { useOpenAaveStateMachineContext } from '../containers/AaveOpenStateMachineContext'
import { OpenAaveEvent, OpenAaveStateMachine, OpenAaveStateMachineState } from '../state/'
import { SidebarOpenAaveVaultEditingState } from './SidebarOpenAaveVaultEditingState'

export interface OpenAaveVaultProps {
  readonly aaveStateMachine: OpenAaveStateMachine
}

interface OpenAaveStateProps {
  readonly state: OpenAaveStateMachineState
  readonly send: Sender<OpenAaveEvent>
}

function OpenAaveTransactionInProgressStateView({ state }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <OpenVaultAnimation />
        <OpenAaveInformationContainer state={state} />
      </Grid>
    ),
    primaryButton: {
      steps: [3, state.context.totalSteps!],
      isLoading: true,
      disabled: true,
      label: t('open-earn.aave.vault-form.confirm-btn'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function OpenAaveReviewingStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <OpenAaveInformationContainer state={state} />
      </Grid>
    ),
    primaryButton: {
      steps: [3, state.context.totalSteps!],
      isLoading: false,
      disabled: !state.can('NEXT_STEP'),
      label: t('open-earn.aave.vault-form.confirm-btn'),
      action: () => send('NEXT_STEP'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function OpenAaveFailureStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <OpenAaveInformationContainer state={state} />
      </Grid>
    ),
    primaryButton: {
      steps: [1, state.context.totalSteps!],
      isLoading: false,
      disabled: false,
      label: t('open-earn.aave.vault-form.retry-btn'),
      action: () => send({ type: 'RETRY' }),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function OpenAaveEditingStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const hasProxy = state.context.proxyAddress !== undefined
  const isProxyCreationDisabled = useFeatureToggle('ProxyCreationDisabled')

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <SidebarOpenAaveVaultEditingState state={state} send={send} />
        <OpenAaveInformationContainer state={state} />
      </Grid>
    ),
    primaryButton: {
      steps: [1, state.context.totalSteps!],
      isLoading: false,
      disabled: !state.can('NEXT_STEP') || (!hasProxy && isProxyCreationDisabled),
      label: hasProxy ? t('open-earn.aave.vault-form.open-btn') : t('create-proxy-btn'),
      action: () => send('NEXT_STEP'),
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
        <OpenAaveInformationContainer state={state} />
      </Grid>
    ),
    primaryButton: {
      label: t('open-earn.aave.vault-form.go-to-position'),
      url: `/aave/${state.context.proxyAddress}`,
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

export function SidebarOpenAaveVault() {
  const { stateMachine } = useOpenAaveStateMachineContext()
  const [state, send] = useActor(stateMachine)
  const { t } = useTranslation()
  const { hasOtherAssetsThanETH_STETH } = state.context

  switch (true) {
    case state.matches('editing'):
      return <OpenAaveEditingStateView state={state} send={send} />
    case state.matches('proxyCreating'):
      return <ProxyView proxyMachine={state.context.refProxyMachine!} />
    case state.matches('settingMultiple'):
      return (
        <AdjustRiskView
          state={state}
          send={send}
          primaryButton={{
            steps: [2, state.context.totalSteps!],
            isLoading: false,
            disabled: false,
            label: t('open-earn.aave.vault-form.open-btn'),
            action: () => send('NEXT_STEP'),
          }}
          textButton={{
            label: 'Back to enter ETH',
            action: () => send('BACK_TO_EDITING'),
          }}
          viewLocked={hasOtherAssetsThanETH_STETH}
        />
      )
    case state.matches('reviewing'):
      return <OpenAaveReviewingStateView state={state} send={send} />
    case state.matches('txInProgress'):
      return <OpenAaveTransactionInProgressStateView state={state} send={send} />
    case state.matches('txFailure'):
      return <OpenAaveFailureStateView state={state} send={send} />
    case state.matches('txSuccess'):
      return <OpenAaveSuccessStateView state={state} send={send} />
    default: {
      return <></>
    }
  }
}
