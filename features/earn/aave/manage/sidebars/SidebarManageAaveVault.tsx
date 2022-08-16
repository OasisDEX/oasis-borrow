import { ProxyView } from '@oasis-borrow/proxy'
import { useMachine } from '@xstate/react'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'
import { Sender } from 'xstate'

import {
  getEstimatedGasFeeTextOld,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../../../../components/vault/VaultChangesInformation'
import {
  ManageAaveEvent,
  ManageAaveStateMachine,
  ManageAaveStateMachineState,
} from '../state/types'
import { SidebarManageAaveVaultEditingState } from './SidebarManageAaveVaultEditingState'
import { extractSidebarTxData } from '../../../../../helpers/extractSidebarHelpers'
import { OpenVaultAnimation } from '../../../../../theme/animations'
import { staticFilesRuntimeUrl } from '../../../../../helpers/staticPaths'

export interface ManageAaveVaultProps {
  readonly aaveStateMachine: ManageAaveStateMachine
}

interface ManageAaveStateProps {
  readonly state: ManageAaveStateMachineState
  readonly send: Sender<ManageAaveEvent>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ManageAaveInformationContainer({ state, send }: ManageAaveStateProps) {
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

function ManageAaveTransactionInProgressStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <OpenVaultAnimation />
        <ManageAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      steps: [1, state.context.totalSteps!],
      isLoading: true,
      disabled: true,
      label: t('manage-earn.aave.vault-form.confirm-btn'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function ManageAaveReviewingStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <ManageAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      steps: [1, state.context.totalSteps!],
      isLoading: false,
      disabled: !state.can('START_CREATING_POSITION'),
      label: t('manage-earn.aave.vault-form.confirm-btn'),
      action: () => send('START_CREATING_POSITION'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function ManageAaveFailureStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <ManageAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      steps: [1, state.context.totalSteps!],
      isLoading: false,
      disabled: false,
      label: t('manage-earn.aave.vault-form.retry-btn'),
      action: () => send({ type: 'RETRY' }),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function ManageAaveEditingStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const canCreateProxy = state.can('CREATE_PROXY')

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <SidebarManageAaveVaultEditingState state={state} send={send} />
        <ManageAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      steps: [1, state.context.totalSteps!],
      isLoading: false,
      disabled: false,
      label: canCreateProxy ? t('create-proxy-btn') : t('manage-earn.aave.vault-form.manage-btn'),
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

function ManageAaveSuccessStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.success-title'),
    content: (
      <Grid gap={3}>
        <Box>
          <Flex sx={{ justifyContent: 'center', mb: 4 }}>
            <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
          </Flex>
        </Box>
        <ManageAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      label: t('manage-earn.aave.vault-form.go-to-position'),
      url: `/earn/${state.context.strategyName}/${state.context.proxyAddress}`,
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

export function SidebarManageAaveVault({ aaveStateMachine }: ManageAaveVaultProps) {
  const [state, send] = useMachine(aaveStateMachine)

  switch (true) {
    case state.matches('editing'):
      return <ManageAaveEditingStateView state={state} send={send} />
    case state.matches('proxyCreating'):
      return <ProxyView proxyMachine={state.context.refProxyStateMachine!} />
    case state.matches('reviewing'):
      return <ManageAaveReviewingStateView state={state} send={send} />
    case state.matches('txInProgress'):
      return <ManageAaveTransactionInProgressStateView state={state} send={send} />
    case state.matches('txFailure'):
      return <ManageAaveFailureStateView state={state} send={send} />
    case state.matches('txSuccess'):
      return <ManageAaveSuccessStateView state={state} send={send} />
    default: {
      return <></>
    }
  }
}
