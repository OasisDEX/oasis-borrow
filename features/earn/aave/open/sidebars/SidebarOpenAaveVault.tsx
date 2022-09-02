import { useMachine } from '@xstate/react'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Box, Flex, Grid, Image } from 'theme-ui'
import { Sender } from 'xstate'

import {
  getEstimatedGasFeeTextOld,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../../../../components/vault/VaultChangesInformation'
import { staticFilesRuntimeUrl } from '../../../../../helpers/staticPaths'
import { OpenVaultAnimation } from '../../../../../theme/animations'
import { ProxyView } from '../../../../proxyNew'
import { OpenAaveEvent, OpenAaveStateMachine, OpenAaveStateMachineState } from '../state/types'
import { SidebarOpenAaveVaultEditingState } from './SidebarOpenAaveVaultEditingState'
import { SliderValuePicker } from '../../../../../components/dumb/SliderValuePicker'
import { BigNumber } from 'bignumber.js'

export interface OpenAaveVaultProps {
  readonly aaveStateMachine: OpenAaveStateMachine
}

interface OpenAaveStateProps {
  readonly state: OpenAaveStateMachineState
  readonly send: Sender<OpenAaveEvent>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function OpenAaveInformationContainer({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationContainer title="Order information">
      <VaultChangesInformationItem
        label={t('transaction-fee')}
        value={getEstimatedGasFeeTextOld(state.context.estimatedGasPrice)}
      />
    </VaultChangesInformationContainer>
  )
}

function OpenAaveTransactionInProgressStateView({ state, send }: OpenAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <OpenVaultAnimation />
        <OpenAaveInformationContainer state={state} send={send} />
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
        <OpenAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      steps: [3, state.context.totalSteps!],
      isLoading: false,
      disabled: !state.can('START_CREATING_POSITION'),
      label: t('open-earn.aave.vault-form.confirm-btn'),
      action: () => send('START_CREATING_POSITION'),
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
        <OpenAaveInformationContainer state={state} send={send} />
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

  const canCreateProxy = state.can('CREATE_PROXY')

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <SidebarOpenAaveVaultEditingState state={state} send={send} />
        <OpenAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      steps: [1, state.context.totalSteps!],
      isLoading: false,
      disabled: false,
      label: canCreateProxy ? t('create-proxy-btn') : t('open-earn.aave.vault-form.open-btn'),
      action: () => {
        if (canCreateProxy) {
          send('CREATE_PROXY')
        } else {
          send('CONFIRM_DEPOSIT')
        }
      },
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
        <Box>
          <Flex sx={{ justifyContent: 'center', mb: 4 }}>
            <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
          </Flex>
        </Box>
        <OpenAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      label: t('open-earn.aave.vault-form.go-to-position'),
      url: `/earn/${state.context.strategyName}/${state.context.proxyAddress}`,
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function SettingMultipleView({ state, send }: OpenAaveStateProps) {
  const hf = state.context.amount?.times(state.context.liquidationThreshold!).div(100)

  const sidebarSectionProps: SidebarSectionProps = {
    title: 'setting multiple',
    content: (
      <Grid gap={3}>
        <SliderValuePicker
          sliderKey="slider-key"
          sliderPercentageFill={new BigNumber(0)}
          leftBoundry={new BigNumber(1)}
          leftBoundryFormatter={(value) => value.toString()}
          rightBoundry={state.context.multiple!}
          rightBoundryFormatter={(value) => value.toFixed(2)}
          onChange={(value) => {
            send({ type: 'SET_MULTIPLE', multiple: value })
          }}
          minBoundry={new BigNumber(1)}
          maxBoundry={state.context.maxMultiple!}
          lastValue={state.context.multiple!}
          disabled={false}
          leftBoundryStyling={{}}
          rightBoundryStyling={{}}
          step={0.01}
        />
        <p>{state.context.multiple?.toFixed(2)}</p>
        <OpenAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      steps: [2, state.context.totalSteps!],
      isLoading: false,
      disabled: false,
      label: 'setting multiple',
      action: () => send('CONFIRM_MULTIPLE'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

export function SidebarOpenAaveVault({ aaveStateMachine }: OpenAaveVaultProps) {
  const [state, send] = useMachine(aaveStateMachine)

  switch (true) {
    case state.matches('editing'):
      return <OpenAaveEditingStateView state={state} send={send} />
    case state.matches('proxyCreating'):
      return <ProxyView proxyMachine={state.context.refProxyStateMachine!} />
    case state.matches('settingMultiple'):
      return <SettingMultipleView state={state} send={send} />
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
