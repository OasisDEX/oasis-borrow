import { IPosition, IStrategy } from '@oasisdex/oasis-actions'
import { useActor } from '@xstate/react'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'
import { Sender } from 'xstate'

import { amountFromWei, amountToWei } from '../../../../../blockchain/utils'
import { formatCryptoBalance } from '../../../../../helpers/formatters/format'
import { staticFilesRuntimeUrl } from '../../../../../helpers/staticPaths'
import { zero } from '../../../../../helpers/zero'
import { OpenVaultAnimation } from '../../../../../theme/animations'
import { StrategyInformationContainer } from '../../common/components/informationContainer'
import { AdjustRiskView } from '../../common/components/SidebarAdjustRiskView'
import { aaveStETHMinimumRiskRatio } from '../../constants'
import { useManageAaveStateMachineContext } from '../containers/AaveManageStateMachineContext'
import { ManageAaveEvent, ManageAaveStateMachineState } from '../state'

interface ManageAaveStateProps {
  readonly state: ManageAaveStateMachineState
  readonly send: Sender<ManageAaveEvent>
}

function getAmountGetFromPositionAfterClose(
  strategy: IStrategy | undefined,
  currentPosition: IPosition,
) {
  if (!strategy) {
    return zero
  }
  const currentDebt = amountToWei(currentPosition.debt.amount, currentPosition.debt.denomination || 'ETH')
  const amountFromSwap = strategy.simulation.swap.toTokenAmount
  const fee = strategy.simulation.swap.targetTokenFee

  return amountFromSwap.minus(currentDebt).minus(fee)
}

function EthBalanceAfterClose({ state }: ManageAaveStateProps) {
  const { t } = useTranslation()
  const balance = formatCryptoBalance(
    amountFromWei(
      getAmountGetFromPositionAfterClose(
        state.context.transactionParameters,
        state.context.currentPosition,
      ),
      state.context.token,
    ),
  )

  return (
    <Flex sx={{ justifyContent: 'space-between' }}>
      <Text variant="boldParagraph3" sx={{ color: 'neutral80' }}>
        {t('manage-earn.aave.vault-form.eth-after-closing')}
      </Text>
      <Text variant="boldParagraph3">
        {balance} {state.context.token}
      </Text>
    </Flex>
  )
}

function ManageAaveTransactionInProgressStateView({ state }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <OpenVaultAnimation />
        <StrategyInformationContainer state={state} />
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

function ManageAaveReviewingClosingStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.close-title'),
    content: (
      <Grid gap={3}>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('manage-earn.aave.vault-form.close-description')}
        </Text>
        <EthBalanceAfterClose state={state} send={send} />
        <StrategyInformationContainer state={state} />
      </Grid>
    ),
    primaryButton: {
      isLoading: false,
      disabled: !state.can('START_TRANSACTION'),
      label: t('manage-earn.aave.vault-form.confirm-btn'),
      action: () => send('START_TRANSACTION'),
    },
    textButton: {
      label: t('manage-earn.aave.vault-form.back-to-editing'),
      action: () => send('BACK_TO_EDITING'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function ManageAaveReviewingAdjustingStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.adjust-title'),
    content: (
      <Grid gap={3}>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('manage-earn.aave.vault-form.adjust-description')}
        </Text>
        <StrategyInformationContainer state={state} />
      </Grid>
    ),
    primaryButton: {
      isLoading: false,
      disabled: !state.can('START_TRANSACTION'),
      label: t('manage-earn.aave.vault-form.confirm-btn'),
      action: () => send('START_TRANSACTION'),
    },
    textButton: {
      label: t('manage-earn.aave.vault-form.back-to-editing'),
      action: () => send('BACK_TO_EDITING'),
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
        <StrategyInformationContainer state={state} />
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
        <StrategyInformationContainer state={state} />
      </Grid>
    ),
    primaryButton: {
      label: t('manage-earn.aave.vault-form.position-adjusted-btn'),
      action: () => send('GO_TO_EDITING'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

export function SidebarManageAaveVault() {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state, send] = useActor(stateMachine)
  const { t } = useTranslation()

  switch (true) {
    case state.matches('editing'):
      return (
        <AdjustRiskView
          state={state}
          resetRiskValue={
            state.context.protocolData?.position.riskRatio || aaveStETHMinimumRiskRatio
          }
          send={send}
          primaryButton={{
            isLoading: state.context.loading,
            disabled: !state.can('ADJUST_POSITION'),
            label: t('manage-earn.aave.vault-form.adjust-risk'),
            action: () => {
              send('ADJUST_POSITION')
            },
          }}
          textButton={{
            isLoading: false,
            disabled: false,
            label: t('manage-earn.aave.vault-form.close'),
            action: () => {
              send('CLOSE_POSITION')
            },
          }}
        />
      )
    case state.matches('reviewingAdjusting'):
      return <ManageAaveReviewingAdjustingStateView state={state} send={send} />
    case state.matches('reviewingClosing'):
      return <ManageAaveReviewingClosingStateView state={state} send={send} />
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
