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
import { staticFilesRuntimeUrl } from '../../../../../helpers/staticPaths'
import { OpenVaultAnimation } from '../../../../../theme/animations'
import {
  ManageAaveEvent,
  ManageAaveStateMachine,
  ManageAaveStateMachineState,
} from '../state/types'
import { SidebarManageAaveVaultEditingState } from './SidebarManageAaveVaultEditingState'

export interface ManageAaveVaultProps {
  readonly aaveStateMachine: ManageAaveStateMachine
}

interface ManageAaveStateProps {
  readonly state: ManageAaveStateMachineState
  readonly send: Sender<ManageAaveEvent>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CloseAaveInformationContainer({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationContainer title="Total fees">
      <VaultChangesInformationItem
        label={t('vault-changes.oasis-fee')}
        value={getEstimatedGasFeeTextOld(state.context.estimatedGasPrice)}
      />
      <VaultChangesInformationItem
        label={t('transaction-fee')}
        value={getEstimatedGasFeeTextOld(state.context.estimatedGasPrice)}
      />
    </VaultChangesInformationContainer>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function EthBalanceAfterClose({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()
  return (
    <Flex sx={{ justifyContent: 'space-between' }}>
      <Text variant="boldParagraph3" sx={{ color: 'neutral80' }}>
        {t('manage-earn.aave.vault-form.eth-after-closing')}
      </Text>
      <Text variant="boldParagraph3">3.2562 ETH ($9,403.20)</Text>
    </Flex>
  )
}

function ManageAaveTransactionInProgressStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <OpenVaultAnimation />
        <CloseAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
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
    title: t('manage-earn.aave.vault-form.close-title'),
    content: (
      <Grid gap={3}>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('manage-earn.aave.vault-form.close-description')}
        </Text>
        <EthBalanceAfterClose state={state} send={send} />
        <CloseAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      isLoading: false,
      disabled: !state.can('START_CLOSING_POSITION'),
      label: t('manage-earn.aave.vault-form.confirm-btn'),
      action: () => send('START_CLOSING_POSITION'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function ManageAaveFailureStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.close-title'),
    content: (
      <Grid gap={3}>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('manage-earn.aave.vault-form.close-description')}
        </Text>
        <EthBalanceAfterClose state={state} send={send} />
        <CloseAaveInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
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

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <SidebarManageAaveVaultEditingState state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      isLoading: false,
      disabled: true,
      label: t('manage-earn.aave.vault-form.deposit'),
      action: () => {
        send('CONFIRM_DEPOSIT')
      },
    },
    textButton: {
      isLoading: false,
      disabled: false,
      label: t('manage-earn.aave.vault-form.close'),
      action: () => {
        send('POSITION_CLOSED')
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
        <CloseAaveInformationContainer state={state} send={send} />
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
