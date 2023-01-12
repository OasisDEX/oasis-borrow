import { Icon } from '@makerdao/dai-ui-icons'
import { IPosition, IPositionTransition, OPERATION_NAMES } from '@oasisdex/oasis-actions'
import { useActor } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { ActionPills } from 'components/ActionPills'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave/strategyConfig'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import { curry } from 'ramda'
import React, { useState } from 'react'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'
import { Sender } from 'xstate'

import { amountFromWei } from '../../../../blockchain/utils'
import { MessageCard } from '../../../../components/MessageCard'
import { allDefined } from '../../../../helpers/allDefined'
import { formatCryptoBalance } from '../../../../helpers/formatters/format'
import { staticFilesRuntimeUrl } from '../../../../helpers/staticPaths'
import { zero } from '../../../../helpers/zero'
import { OpenVaultAnimation } from '../../../../theme/animations'
import { AllowanceView } from '../../../stateMachines/allowance'
import { isAllowanceNeeded } from '../../common/BaseAaveContext'
import { StrategyInformationContainer } from '../../common/components/informationContainer'
import { useManageAaveStateMachineContext } from '../containers/AaveManageStateMachineContext'
import { ManageAaveContext, ManageAaveEvent, ManageAaveStateMachineState } from '../state'

interface ManageAaveStateProps {
  readonly state: ManageAaveStateMachineState
  readonly send: Sender<ManageAaveEvent>
}

type WithDropdownConfig<T> = T & { dropdownConfig?: SidebarSectionHeaderDropdown }

function isLoading(state: ManageAaveStateMachineState) {
  return state.matches('background.loading')
}

function isLocked(state: ManageAaveStateMachineState) {
  const { ownerAddress, web3Context } = state.context
  return !(allDefined(ownerAddress, web3Context) && ownerAddress === web3Context!.account)
}

function getAmountGetFromPositionAfterClose(
  strategy: IPositionTransition | undefined,
  currentPosition: IPosition | undefined,
) {
  if (!strategy || !currentPosition) {
    return zero
  }

  const fee =
    strategy.simulation.swap.collectFeeFrom === 'targetToken'
      ? strategy.simulation.swap.tokenFee
      : zero // fee already accounted for in toTokenAmount

  return strategy.simulation.swap.toTokenAmount.minus(currentPosition.debt.amount).minus(fee)
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

function calculateMaxDebtAmount(context: ManageAaveContext): BigNumber {
  if (context.manageTokenInput?.manageTokenAction === ManageDebtActionsEnum.BORROW_DEBT) {
    return amountFromWei(
      context.currentPosition?.maxDebtToBorrow || zero,
      context.currentPosition?.debt.symbol || '',
    )
  }
  const currentDebt = amountFromWei(
    context.currentPosition?.debt.amount || zero,
    context.currentPosition?.debt.symbol || '',
  )

  const currentBalance = context.balance?.debt?.balance || zero

  return currentDebt.lte(currentBalance) ? currentDebt : currentBalance
}

function calculateMaxCollateralAmount(context: ManageAaveContext): BigNumber {
  if (
    context.manageTokenInput?.manageTokenAction === ManageCollateralActionsEnum.WITHDRAW_COLLATERAL
  ) {
    return amountFromWei(
      context.currentPosition?.maxCollateralToWithdraw || zero,
      context.currentPosition?.collateral.symbol || '',
    )
  }
  return context.balance?.collateral.balance || zero
}

function GetReviewingSidebarProps({
  state,
  send,
}: ManageAaveStateProps): Pick<SidebarSectionProps, 'title' | 'content'> {
  const { t } = useTranslation()
  const { collateral, debt } = state.context.tokens
  const [closeToToken, setCloseToToken] = useState(debt) // only close to debt is available ATM

  const updateCollateralTokenAction = (manageTokenAction: ManageCollateralActionsEnum) => {
    send({ type: 'UPDATE_COLLATERAL_TOKEN_ACTION', manageTokenAction })
  }
  const updateDebtTokenAction = (manageTokenAction: ManageDebtActionsEnum) => {
    send({ type: 'UPDATE_DEBT_TOKEN_ACTION', manageTokenAction })
  }
  const updateTokenActionValue = (manageTokenActionValue?: BigNumber) => {
    send({ type: 'UPDATE_TOKEN_ACTION_VALUE', manageTokenActionValue })
  }

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
                disabled: token === collateral, // only close to debt is available ATM
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
      const maxCollateralAmount = calculateMaxCollateralAmount(state.context)
      const amountCollateralTooHigh = maxCollateralAmount.lt(
        state.context.manageTokenInput?.manageTokenActionValue || zero,
      )
      return {
        title: t('system.manage-collateral'),
        content: (
          <Grid gap={3}>
            <ActionPills
              active={state.context.manageTokenInput?.manageTokenAction!}
              items={Object.values(ManageCollateralActionsEnum).map((action) => ({
                id: action,
                label: t(`system.actions.multiply.${action}`),
                action: () => curry(updateCollateralTokenAction)(action),
              }))}
            />
            <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
              {t('system.manage-collateral')}
            </Text>
            <VaultActionInput
              action="Enter"
              currencyCode={collateral}
              maxAmountLabel={t('balance')}
              maxAmount={maxCollateralAmount}
              showMax={true}
              onSetMax={() => {
                updateTokenActionValue(maxCollateralAmount)
              }}
              amount={state.context.manageTokenInput?.manageTokenActionValue}
              onChange={handleNumericInput(updateTokenActionValue)}
              hasError={false}
            />
            {amountCollateralTooHigh && (
              <MessageCard
                messages={
                  state.context.manageTokenInput?.manageTokenAction ===
                  ManageCollateralActionsEnum.WITHDRAW_COLLATERAL
                    ? [
                        t('vault-errors.withdraw-amount-exceeds-free-collateral', {
                          maxWithdrawAmount: formatCryptoBalance(maxCollateralAmount),
                          token: state.context.tokens.collateral,
                        }),
                      ]
                    : [t('vault-errors.deposit-amount-exceeds-collateral-balance')]
                }
                type="error"
              />
            )}
            <StrategyInformationContainer state={state} />
          </Grid>
        ),
      }
    case state.matches('frontend.manageDebt'):
      const maxDebtAmount = calculateMaxDebtAmount(state.context)
      const amountDebtTooHigh = maxDebtAmount.lt(
        state.context.manageTokenInput?.manageTokenActionValue || zero,
      )
      return {
        title: t('system.manage-debt'),
        content: (
          <Grid gap={3}>
            <ActionPills
              active={state.context.manageTokenInput?.manageTokenAction!}
              items={Object.values(ManageDebtActionsEnum).map((action) => ({
                id: action,
                label: t(`system.actions.multiply.${action}`),
                action: () => curry(updateDebtTokenAction)(action),
              }))}
            />
            <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
              {t('system.manage-debt')}
            </Text>
            <VaultActionInput
              action="Enter"
              currencyCode={debt}
              maxAmountLabel={t('balance')}
              maxAmount={maxDebtAmount}
              showMax={true}
              onSetMax={() => {
                updateTokenActionValue(maxDebtAmount)
              }}
              amount={state.context.manageTokenInput?.manageTokenActionValue}
              onChange={handleNumericInput(updateTokenActionValue)}
              hasError={false}
            />
            {amountDebtTooHigh && (
              <MessageCard
                messages={
                  state.context.manageTokenInput?.manageTokenAction ===
                  ManageDebtActionsEnum.PAYBACK_DEBT
                    ? [
                        t('vault-errors.payback-amount-exceeds', {
                          maxPaybackAmount: formatCryptoBalance(maxDebtAmount),
                          token: state.context.tokens.debt,
                        }),
                      ]
                    : [
                        t('vault-errors.borrow-amount-exceeds-max', {
                          maxBorrowAmount: formatCryptoBalance(maxDebtAmount),
                          token: state.context.tokens.debt,
                        }),
                      ]
                }
                type="error"
              />
            )}
            <StrategyInformationContainer state={state} />
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

  const allowanceNeeded = isAllowanceNeeded(state.context)

  const label = allowanceNeeded
    ? t('set-allowance-for', {
        token: state.context.transactionToken || state.context.strategyConfig.tokens.deposit,
      })
    : t('manage-earn.aave.vault-form.confirm-btn')

  const sidebarSectionProps: SidebarSectionProps = {
    ...GetReviewingSidebarProps({ state, send }),
    primaryButton: {
      isLoading: false,
      disabled: !state.can('NEXT_STEP') || isLocked(state),
      label: label,
      action: () => send('NEXT_STEP'),
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
    textButton: {
      label: t('manage-earn.aave.vault-form.back-to-editing'),
      action: () => send('BACK_TO_EDITING'),
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
      url: `/${state.context.strategyConfig.type.toLocaleLowerCase()}/aave/open/${
        state.context.strategyConfig.urlSlug
      }`,
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
        label: t('system.manage-collateral-token', {
          token: state.context.tokens.collateral,
        }),
        shortLabel: t('system.manage-token', {
          token: state.context.tokens.collateral,
        }),
        icon: getToken(state.context.tokens.collateral).iconCircle,
        panel: 'manageCollateral',
        action: () => {
          if (!state.matches('frontend.manageCollateral')) {
            send({
              type: 'MANAGE_COLLATERAL',
              manageTokenAction: ManageCollateralActionsEnum.DEPOSIT_COLLATERAL,
            })
          }
        },
      },
      {
        label: t('system.manage-debt-token', {
          token: state.context.tokens.debt,
        }),
        shortLabel: t('system.manage-token', {
          token: state.context.tokens.debt,
        }),
        icon: getToken(state.context.tokens.debt).iconCircle,
        panel: 'manageDebt',
        action: () => {
          if (!state.matches('frontend.manageDebt')) {
            send({ type: 'MANAGE_DEBT', manageTokenAction: ManageDebtActionsEnum.BORROW_DEBT })
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
          title={
            state.context.strategyConfig.type === 'Earn'
              ? t('sidebar-titles.manage-earn-position')
              : t('sidebar-titles.manage-multiply-position')
          }
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
    case state.matches('frontend.allowanceDebtSetting'):
    case state.matches('frontend.allowanceCollateralSetting'):
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
      state.context.strategy?.transaction.operationName === OPERATION_NAMES.aave.CLOSE_POSITION:
      return <ManageAaveSuccessClosePositionStateView state={state} send={send} />
    case state.matches('frontend.txSuccess'):
      return <ManageAaveSuccessAdjustPositionStateView state={state} send={send} />
    default: {
      return <></>
    }
  }
}
