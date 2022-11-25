import { IPosition, IPositionTransition, OPERATION_NAMES } from '@oasisdex/oasis-actions'
import { useActor } from '@xstate/react'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'
import { Sender } from 'xstate'

import { amountFromWei, amountToWei } from '../../../../blockchain/utils'
import { formatCryptoBalance } from '../../../../helpers/formatters/format'
import { staticFilesRuntimeUrl } from '../../../../helpers/staticPaths'
import { zero } from '../../../../helpers/zero'
import { OpenVaultAnimation } from '../../../../theme/animations'
import { StrategyInformationContainer } from '../../common/components/informationContainer'
import { useManageAaveStateMachineContext } from '../containers/AaveManageStateMachineContext'
import { ManageAaveEvent, ManageAaveStateMachineState } from '../state'

interface ManageAaveStateProps {
  readonly state: ManageAaveStateMachineState
  readonly send: Sender<ManageAaveEvent>
}

function isLoading(state: ManageAaveStateMachineState) {
  return state.matches('background.loading')
}

function isLocked(state: ManageAaveStateMachineState) {
  return (
    state.context.proxyAddress === undefined ||
    state.context.connectedProxyAddress === undefined ||
    state.context.connectedProxyAddress !== state.context.proxyAddress
  )
}

function getAmountGetFromPositionAfterClose(
  strategy: IPositionTransition | undefined,
  currentPosition: IPosition | undefined,
) {
  if (!strategy || !currentPosition) {
    return zero
  }
  const currentDebt = amountToWei(currentPosition.debt.amount, currentPosition.debt.symbol)
  const amountFromSwap = strategy.simulation.swap.toTokenAmount
  const fee = strategy.simulation.swap.tokenFee

  return amountFromSwap.minus(currentDebt).minus(fee)
}

function EthBalanceAfterClose({ state }: ManageAaveStateProps) {
  const { t } = useTranslation()
  const displayToken = state.context.strategy?.simulation.swap.targetToken || {
    symbol: 'ETH',
    precision: 18,
  }
  const balance = formatCryptoBalance(
    amountFromWei(
      getAmountGetFromPositionAfterClose(state.context.strategy, state.context.currentPosition),
      displayToken.symbol,
    ),
  )

  return (
    <Flex sx={{ justifyContent: 'space-between' }}>
      <Text variant="boldParagraph3" sx={{ color: 'neutral80' }}>
        {t('manage-earn.aave.vault-form.eth-after-closing')}
      </Text>
      <Text variant="boldParagraph3">
        {balance} {displayToken.symbol}
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

function GetReviewingSidebarProps({
  state,
  send,
}: ManageAaveStateProps): Pick<SidebarSectionProps, 'title' | 'content'> {
  const { t } = useTranslation()
  const { operationName } = state.context

  if (operationName === OPERATION_NAMES.aave.CLOSE_POSITION) {
    return {
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
    }
  } else {
    return {
      title: t('manage-earn.aave.vault-form.adjust-title'),
      content: (
        <Grid gap={3}>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('manage-earn.aave.vault-form.adjust-description')}
          </Text>
          <StrategyInformationContainer state={state} />
        </Grid>
      ),
    }
  }
}

function ManageAaveReviewingStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    ...GetReviewingSidebarProps({ state, send }),
    primaryButton: {
      isLoading: false,
      disabled: !state.can('START_TRANSACTION') || isLocked(state),
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
    ...GetReviewingSidebarProps({ state, send }),
    primaryButton: {
      isLoading: false,
      disabled: false,
      label: t('manage-earn.aave.vault-form.retry-btn'),
      action: () => send({ type: 'RETRY' }),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function ManageAaveSuccessAdjustPositionStateView({ state }: ManageAaveStateProps) {
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
      action: () => location && location.reload(),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function ManageAaveSuccessClosePositionStateView({ state }: ManageAaveStateProps) {
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
      url: `/earn/aave/open/${state.context.strategy}`,
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

export function SidebarManageAaveVault() {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state, send] = useActor(stateMachine)
  const { t } = useTranslation()

  function loading(): boolean {
    return isLoading(state)
  }

  const AdjustRiskView = state.context.strategyConfig.viewComponents.adjustRiskView

  switch (true) {
    case state.matches('frontend.editing'):
      return (
        <AdjustRiskView
          state={state}
          onChainPosition={state.context.protocolData?.position}
          isLoading={loading}
          send={send}
          primaryButton={{
            isLoading: loading(),
            disabled: !state.can('ADJUST_POSITION') || isLocked(state),
            label: t('manage-earn.aave.vault-form.adjust-risk'),
            action: () => {
              send('ADJUST_POSITION')
            },
          }}
          textButton={{
            isLoading: false,
            disabled: isLocked(state),
            label: t('manage-earn.aave.vault-form.close'),
            action: () => {
              send('CLOSE_POSITION')
            },
          }}
          viewLocked={isLocked(state)}
        />
      )
    case state.matches('frontend.reviewingAdjusting'):
      return <ManageAaveReviewingStateView state={state} send={send} />
    case state.matches('frontend.reviewingClosing'):
      return <ManageAaveReviewingStateView state={state} send={send} />
    case state.matches('frontend.txInProgress'):
      return <ManageAaveTransactionInProgressStateView state={state} send={send} />
    case state.matches('frontend.txFailure'):
      return <ManageAaveFailureStateView state={state} send={send} />
    case state.matches('frontend.txSuccess') &&
      state.context.operationName === OPERATION_NAMES.aave.CLOSE_POSITION:
      return <ManageAaveSuccessClosePositionStateView state={state} send={send} />
    case state.matches('frontend.txSuccess'):
      return <ManageAaveSuccessAdjustPositionStateView state={state} send={send} />
    default: {
      return <></>
    }
  }
}
