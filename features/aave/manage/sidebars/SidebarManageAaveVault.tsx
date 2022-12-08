import { Icon } from '@makerdao/dai-ui-icons'
import { IPosition, IStrategy, OPERATION_NAMES } from '@oasisdex/oasis-actions'
import { useActor } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { ActionPills } from 'components/ActionPills'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import { curry } from 'ramda'
import React, { useState } from 'react'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'
import { Sender } from 'xstate'

import { amountFromWei } from '../../../../blockchain/utils'
import { formatCryptoBalance } from '../../../../helpers/formatters/format'
import { staticFilesRuntimeUrl } from '../../../../helpers/staticPaths'
import { zero } from '../../../../helpers/zero'
import { OpenVaultAnimation } from '../../../../theme/animations'
import { AllowanceView } from '../../../stateMachines/allowance'
import { StrategyInformationContainer } from '../../common/components/informationContainer'
import { useManageAaveStateMachineContext } from '../containers/AaveManageStateMachineContext'
import { ManageAaveEvent, ManageAaveStateMachineState } from '../state'

interface ManageAaveStateProps {
  readonly state: ManageAaveStateMachineState
  readonly send: Sender<ManageAaveEvent>
}

type WithDropdownConfig<T> = T & { dropdownConfig?: SidebarSectionHeaderDropdown }
enum ManageTokenActionsEnum {
  BUY_COLLATERAL = 'buy-coll', // actual keys from translations system.actions.multiply
  REDUCE_DEBT = 'reduce-debt',
  WITHDRAW = 'withdraw',
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
  strategy: IStrategy | undefined,
  currentPosition: IPosition | undefined,
) {
  if (!strategy || !currentPosition) {
    return zero
  }
  const currentDebt = currentPosition.debt.amount
  const amountFromSwap = strategy.simulation.swap.toTokenAmount
  const fromTokenFee = strategy.simulation.swap?.sourceTokenFee || zero
  const toTokenFee = strategy.simulation.swap?.targetTokenFee || zero
  const fee = fromTokenFee.plus(toTokenFee)

  return amountFromSwap.minus(currentDebt).minus(fee)
}

function BalanceAfterClose({ state, token }: ManageAaveStateProps & { token: string }) {
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
      <Flex>
        <Icon name={getToken(token).iconCircle} size={22} sx={{ mr: 1 }} />
        <Text variant="boldParagraph3" sx={{ color: 'neutral80' }}>
          {t('manage-earn.aave.vault-form.token-amount-after-closing', { token })}
        </Text>
      </Flex>
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
  const { collateral, debt } = state.context.tokens
  const [closeToToken, setCloseToToken] = useState(collateral)
  const [manageCollateralAction, setManageCollateralAction] = useState<ManageTokenActionsEnum>(
    ManageTokenActionsEnum.BUY_COLLATERAL,
  )
  const [manageDebtAction, setManageDebtAction] = useState<ManageTokenActionsEnum>(
    ManageTokenActionsEnum.REDUCE_DEBT,
  )

  const manageTokenActionsList = [
    ManageTokenActionsEnum.BUY_COLLATERAL,
    ManageTokenActionsEnum.REDUCE_DEBT,
    ManageTokenActionsEnum.WITHDRAW,
  ]

  switch (true) {
    case state.matches('frontend.reviewingClosing'):
      return {
        title: t('manage-earn.aave.vault-form.close-to-title', { token: closeToToken }),
        content: (
          <Grid gap={3}>
            <ActionPills
              active={closeToToken}
              items={[collateral, debt].map((token) => ({
                id: token,
                label: t('close-to', { token }),
                action: () => curry(setCloseToToken)(token),
              }))}
            />
            <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
              {t('manage-earn.aave.vault-form.close-description')}
            </Text>
            <BalanceAfterClose state={state} send={send} token={closeToToken} />
            <StrategyInformationContainer state={state} />
          </Grid>
        ),
      }
    case state.matches('frontend.manageCollateral'):
      return {
        title: 'Manage collateral',
        content: (
          <Grid gap={3}>
            <ActionPills
              active={manageCollateralAction}
              items={manageTokenActionsList.map((action) => ({
                id: action,
                label: t(`system.actions.multiply.${action}`),
                action: () => curry(setManageCollateralAction)(action),
              }))}
            />
            <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
              Manage collateral
            </Text>
            <VaultActionInput
              action="Enter"
              currencyCode={collateral}
              tokenUsdPrice={new BigNumber(150)}
              maxAmountLabel={'Balance'}
              amount={new BigNumber(150)}
              onChange={handleNumericInput(() => new BigNumber(150))}
              hasError={false}
            />
          </Grid>
        ),
      }
    case state.matches('frontend.manageDebt'):
      return {
        title: 'Manage debt',
        content: (
          <Grid gap={3}>
            <ActionPills
              active={manageDebtAction}
              items={manageTokenActionsList.map((action) => ({
                id: action,
                label: t(`system.actions.multiply.${action}`),
                action: () => curry(setManageDebtAction)(action),
              }))}
            />
            <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
              Manage debt
            </Text>
            <VaultActionInput
              action="Enter"
              currencyCode={debt}
              tokenUsdPrice={new BigNumber(150)}
              maxAmountLabel={'Balance'}
              amount={new BigNumber(150)}
              onChange={handleNumericInput(() => new BigNumber(150))}
              hasError={false}
            />
          </Grid>
        ),
      }
    default:
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

function ManageAaveReviewingStateView({
  state,
  send,
  dropdownConfig,
}: WithDropdownConfig<ManageAaveStateProps>) {
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
    dropdown: dropdownConfig,
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

  const dropdownConfig: SidebarSectionHeaderDropdown = {
    disabled: false,
    forcePanel: (state.value as Record<string, string>).frontend,
    items: [
      {
        label: t('adjust'),
        icon: 'circle_slider',
        panel: 'editing',
        action: () => {
          if (!state.matches('frontend.editing')) {
            send('BACK_TO_EDITING')
          }
        },
      },
      {
        label: t('system.manage-collateral', {
          token: state.context.tokens.collateral,
        }),
        shortLabel: t('system.manage-token', {
          token: state.context.tokens.collateral,
        }),
        icon: getToken(state.context.tokens.collateral).iconCircle,
        panel: 'manageCollateral',
        action: () => {
          if (!state.matches('frontend.manageCollateral')) {
            send('MANAGE_COLLATERAL')
          }
        },
      },
      {
        label: t('system.manage-debt', {
          token: state.context.tokens.debt,
        }),
        shortLabel: t('system.manage-token', {
          token: state.context.tokens.debt,
        }),
        icon: getToken(state.context.tokens.debt).iconCircle,
        panel: 'manageDebt',
        action: () => {
          if (!state.matches('frontend.manageDebt')) {
            send('MANAGE_DEBT')
          }
        },
      },
      {
        label: t('system.close-position'),
        icon: 'circle_close',
        panel: 'reviewingClosing',
        action: () => {
          if (!state.matches('frontend.reviewingClosing')) {
            send('CLOSE_POSITION')
          }
        },
      },
    ],
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
          dropdownConfig={dropdownConfig}
        />
      )
    case state.matches('frontend.allowanceSetting'):
      return (
        <AllowanceView
          allowanceMachine={state.context.refAllowanceStateMachine!}
          steps={[state.context.currentStep, state.context.totalSteps]}
        />
      )
    case state.matches('frontend.reviewingAdjusting'):
    case state.matches('frontend.reviewingClosing'):
    case state.matches('frontend.manageCollateral'):
    case state.matches('frontend.manageDebt'):
      return (
        <ManageAaveReviewingStateView state={state} send={send} dropdownConfig={dropdownConfig} />
      )
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
