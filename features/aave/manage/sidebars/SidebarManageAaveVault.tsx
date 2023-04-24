import { Icon } from '@makerdao/dai-ui-icons'
import {
  IPosition,
  IPositionTransition,
  ISimplePositionTransition,
  OPERATION_NAMES,
} from '@oasisdex/oasis-actions'
import { useActor } from '@xstate/react'
import { transitionHasSwap } from 'actions/aave'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { amountFromWei } from 'blockchain/utils'
import { ActionPills } from 'components/ActionPills'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { MessageCard } from 'components/MessageCard'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { SidebarSectionHeaderSelectItem } from 'components/sidebar/SidebarSectionHeaderSelect'
import { Skeleton } from 'components/Skeleton'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { ManagePositionAvailableActions } from 'features/aave/common'
import { isAllowanceNeeded } from 'features/aave/common/BaseAaveContext'
import { StrategyInformationContainer } from 'features/aave/common/components/informationContainer'
import { StopLossAaveErrorMessage } from 'features/aave/manage/components/StopLossAaveErrorMessage'
import { useManageAaveStateMachineContext } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import {
  ManageAaveContext,
  ManageAaveEvent,
  ManageAaveStateMachineState,
} from 'features/aave/manage/state'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave/strategyConfig'
import { AllowanceView } from 'features/stateMachines/allowance'
import { allDefined } from 'helpers/allDefined'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { getAaveStrategyUrl } from 'helpers/getAaveStrategyUrl'
import { handleNumericInput } from 'helpers/input'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import { curry } from 'ramda'
import React from 'react'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'
import { Sender } from 'xstate'

export interface ManageAaveAutomation {
  stopLoss: {
    isStopLossEnabled?: boolean
    stopLossLevel?: BigNumber
    stopLossError?: boolean
  }
}

interface ManageAaveStateProps {
  readonly state: ManageAaveStateMachineState
  readonly send: Sender<ManageAaveEvent>
  readonly automation?: ManageAaveAutomation
}

type WithDropdownConfig<T> = T & { dropdownConfig?: SidebarSectionHeaderDropdown }

function isLoading(state: ManageAaveStateMachineState) {
  return (
    state.matches('background.loading') ||
    state.matches('background.debouncing') ||
    state.matches('background.debouncingManage') ||
    state.matches('background.loadingManage')
  )
}

function isLocked(state: ManageAaveStateMachineState) {
  const { ownerAddress, web3Context } = state.context
  return !(allDefined(ownerAddress, web3Context) && ownerAddress === web3Context!.account)
}

function textButtonReturningToAdjust({
  state,
  send,
}: ManageAaveStateProps): Pick<SidebarSectionProps, 'textButton'> {
  const { t } = useTranslation()
  if (state.can('BACK_TO_EDITING')) {
    return {
      textButton: {
        label: t('manage-earn.aave.vault-form.back-to-editing'),
        action: () => send('BACK_TO_EDITING'),
      },
    }
  }
  return {}
}

/*

if closing to collateral, and there is debt on the position, then we are swapping from collateral to debt:

1. take out collateral
2. swap as much of it as we need to debt (fee)
3. pay back the debt

final position amount:
    collateral in vault - collateral needed for swap from token

if closing to collateral, no debt:
- then there would be no swap, so no collateral needed for swap (zero)
- formula the same

if closing to debt, and there is debt on the position, then:

1. withdraw all collateral
2. swap it all to debt (fee)
3. pay back debt

final position amount:
    amount from swap (- minus fee maybe) - debt in position

if closing to debt, with no debt:
- there will still be a swap
- there is no debt in position
- formula is the same

 */

function getAmountReceivedAfterClose(
  strategy: IPositionTransition | ISimplePositionTransition | undefined,
  currentPosition: IPosition | undefined,
  isCloseToCollateral: boolean,
) {
  if (!strategy || !currentPosition) {
    return zero
  }

  const { fee, fromTokenAmount, toTokenAmount } = transitionHasSwap(strategy)
    ? {
        fromTokenAmount: strategy.simulation.swap.fromTokenAmount,
        toTokenAmount: strategy.simulation.swap.toTokenAmount,
        fee:
          strategy.simulation.swap.collectFeeFrom === 'targetToken'
            ? strategy.simulation.swap.tokenFee
            : zero, // fee already accounted for in toTokenAmount
      }
    : {
        fromTokenAmount: zero,
        toTokenAmount: zero,
        fee: zero,
      }

  if (isCloseToCollateral) {
    return currentPosition.collateral.amount.minus(fromTokenAmount)
  }

  return toTokenAmount.minus(currentPosition.debt.amount).minus(fee)
}

function BalanceAfterClose({ state }: ManageAaveStateProps) {
  const { t } = useTranslation()
  const closingToken = state.context.manageTokenInput!.closingToken!
  const isCloseToCollateral = closingToken === state.context.currentPosition?.collateral.symbol

  const balance = formatCryptoBalance(
    amountFromWei(
      getAmountReceivedAfterClose(
        state.context.transition,
        state.context.currentPosition,
        isCloseToCollateral,
      ),
      closingToken,
    ),
  )

  return (
    <Flex sx={{ justifyContent: 'space-between' }}>
      <Flex>
        <Icon name={getToken(closingToken).iconCircle} size={22} sx={{ mr: 1 }} />
        <Text variant="boldParagraph3" sx={{ color: 'neutral80', whiteSpace: 'pre' }}>
          {t('manage-earn.aave.vault-form.token-amount-after-closing', { token: closingToken })}
        </Text>
      </Flex>
      {isLoading(state) ? (
        <Skeleton width={100} />
      ) : (
        <Text variant="boldParagraph3">
          {balance} {closingToken}
        </Text>
      )}
    </Flex>
  )
}

function ManageAaveTransactionInProgressStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.adjust-title'),
    content: (
      <Grid gap={3}>
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
      isLoading: true,
      disabled: true,
      label: t('manage-earn.aave.vault-form.confirm-btn'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function calculateMaxDebtAmount(context: ManageAaveContext): BigNumber {
  if (context.currentPosition === undefined) {
    return zero
  }
  if (context.manageTokenInput?.manageTokenAction === ManageDebtActionsEnum.BORROW_DEBT) {
    const position = context.currentPosition
    const collateral = amountFromWei(position.collateral.amount, position.collateral.symbol)
    const debt = amountFromWei(position.debt.amount, position.debt.symbol)
    return collateral
      .times(context.collateralPrice || zero)
      .times(position.category.maxLoanToValue)
      .minus(debt.times(context.debtPrice || zero))
  }

  const currentDebt = amountFromWei(
    context.currentPosition.debtToPaybackAll,
    context.currentPosition?.debt.symbol,
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
  automation,
}: ManageAaveStateProps): Pick<SidebarSectionProps, 'title' | 'content'> {
  const { t } = useTranslation()
  const { collateral, debt } = state.context.tokens
  const stopLossError = automation?.stopLoss.stopLossError

  const updateClosingAction = (closingToken: string) => {
    if (closingToken === state.context.manageTokenInput?.closingToken) return
    send({ type: 'UPDATE_CLOSING_ACTION', closingToken })
  }

  const updateCollateralTokenAction = (manageTokenAction: ManageCollateralActionsEnum) => {
    send({ type: 'UPDATE_COLLATERAL_TOKEN_ACTION', manageTokenAction })
  }
  const updateDebtTokenAction = (manageTokenAction: ManageDebtActionsEnum) => {
    send({ type: 'UPDATE_DEBT_TOKEN_ACTION', manageTokenAction })
  }
  const updateTokenActionValue = (manageTokenActionValue?: BigNumber) => {
    send({ type: 'UPDATE_TOKEN_ACTION_VALUE', manageTokenActionValue })
  }

  const closeToToken = state.context.manageTokenInput?.closingToken

  switch (true) {
    case state.matches('frontend.reviewingClosing'):
      return {
        title: closeToToken
          ? t('manage-earn.aave.vault-form.close-position-to', { token: closeToToken })
          : t('manage-earn.aave.vault-form.close-position'),
        content: (
          <Grid gap={3}>
            <ActionPills
              active={closeToToken || ''}
              items={[collateral, debt].map((token) => ({
                id: token,
                label: t('close-to', { token }),
                action: () => curry(updateClosingAction)(token),
              }))}
            />
            <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
              {t('manage-earn.aave.vault-form.close-description', { closeToToken })}
            </Text>
            {closeToToken && <BalanceAfterClose state={state} send={send} />}
            {closeToToken && (
              <StrategyInformationContainer
                state={state}
                changeSlippageSource={(from) => {
                  send({ type: 'USE_SLIPPAGE', getSlippageFrom: from })
                }}
              />
            )}
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
              currencyDigits={getToken(collateral).digits}
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
            {stopLossError && <StopLossAaveErrorMessage />}
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
            <StrategyInformationContainer
              state={state}
              changeSlippageSource={(from) => {
                send({ type: 'USE_SLIPPAGE', getSlippageFrom: from })
              }}
            />
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
              currencyDigits={getToken(debt).digits}
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
            {stopLossError && <StopLossAaveErrorMessage />}
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
            <StrategyInformationContainer
              state={state}
              changeSlippageSource={(from) => {
                send({ type: 'USE_SLIPPAGE', getSlippageFrom: from })
              }}
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
            <StrategyInformationContainer
              state={state}
              changeSlippageSource={(from) => {
                send({ type: 'USE_SLIPPAGE', getSlippageFrom: from })
              }}
            />
          </Grid>
        ),
      }
  }
}

function ManageAaveReviewingStateView({
  state,
  send,
  dropdownConfig,
  automation,
}: WithDropdownConfig<ManageAaveStateProps>) {
  const { t } = useTranslation()

  const allowanceNeeded = isAllowanceNeeded(state.context)
  // TODO validation suppressed for testing trigger execution
  // const stopLossError = automation?.stopLoss?.stopLossError

  const label = allowanceNeeded
    ? t('set-allowance-for', {
        token: state.context.transactionToken || state.context.strategyConfig.tokens.deposit,
      })
    : t('manage-earn.aave.vault-form.confirm-btn')

  const sidebarSectionProps: SidebarSectionProps = {
    ...GetReviewingSidebarProps({ state, send, automation }),
    primaryButton: {
      isLoading: false,
      disabled: !state.can('NEXT_STEP') || isLocked(state),
      // TODO validation suppressed for testing trigger execution
      // || stopLossError,
      label: label,
      action: () => send('NEXT_STEP'),
    },
    textButton: textButtonReturningToAdjust({ state, send }).textButton,
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
    textButton: textButtonReturningToAdjust({ state, send }).textButton,
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function ManageAaveSuccessAdjustPositionStateView({ state, send }: ManageAaveStateProps) {
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
        <StrategyInformationContainer
          state={state}
          changeSlippageSource={(from) => {
            send({ type: 'USE_SLIPPAGE', getSlippageFrom: from })
          }}
        />
      </Grid>
    ),
    primaryButton: {
      label: t('manage-earn.aave.vault-form.position-adjusted-btn'),
      action: () => location && location.reload(),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function ManageAaveSuccessClosePositionStateView({ state, send }: ManageAaveStateProps) {
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
        <StrategyInformationContainer
          state={state}
          changeSlippageSource={(from) => {
            send({ type: 'USE_SLIPPAGE', getSlippageFrom: from })
          }}
        />
      </Grid>
    ),
    primaryButton: {
      label: t('manage-earn.aave.vault-form.position-adjusted-btn'),
      url: getAaveStrategyUrl({
        protocol: state.context.strategyConfig.protocol,
        slug: state.context.strategyConfig.urlSlug,
        strategyType: state.context.strategyConfig.type,
      }),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function getDropdownConfig({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()
  const itemPerAction: Record<ManagePositionAvailableActions, SidebarSectionHeaderSelectItem> = {
    adjust: {
      label: t('adjust'),
      icon: 'circle_slider',
      panel: 'editing',
      action: () => {
        if (!state.matches('frontend.editing')) {
          send('BACK_TO_EDITING')
        }
      },
    },
    'manage-debt': {
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
    'manage-collateral': {
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
    close: {
      label: t('system.close-position'),
      icon: 'circle_close',
      panel: 'reviewingClosing',
      action: () => {
        if (!state.matches('frontend.reviewingClosing')) {
          send('CLOSE_POSITION')
        }
      },
    },
  }
  const strategyAvailableActions = state.context.strategyConfig.availableActions.map(
    (action) => itemPerAction[action],
  )

  const dropdownConfig: SidebarSectionHeaderDropdown = {
    disabled: false,
    forcePanel: (state.value as Record<string, string>).frontend,
    items: strategyAvailableActions,
  }
  return dropdownConfig
}

export function SidebarManageAaveVault() {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state, send] = useActor(stateMachine)
  const { t } = useTranslation()
  const {
    triggerData: {
      stopLossTriggerData: { isStopLossEnabled, stopLossLevel },
    },
  } = useAutomationContext()

  const stopLossError =
    isStopLossEnabled &&
    state.context.transition?.simulation?.position.riskRatio.loanToValue.gte(stopLossLevel)

  function loading(): boolean {
    return isLoading(state)
  }

  const dropdownConfig = getDropdownConfig({ state, send })

  const SecondaryInputComponent = state.context.strategyConfig.viewComponents.secondaryInput

  switch (true) {
    case state.matches('frontend.editing'):
      return (
        <SidebarSection
          title={
            state.context.strategyConfig.type === 'Earn'
              ? t('manage-earn.aave.vault-form.manage-title')
              : t('manage-multiply.sidebar.title')
          }
          content={
            <Grid gap={3}>
              <SecondaryInputComponent
                state={state}
                onChainPosition={state.context.protocolData?.position}
                isLoading={loading}
                send={send}
                viewLocked={isLocked(state)}
                stopLossError={stopLossError}
              />
              <StrategyInformationContainer
                state={state}
                changeSlippageSource={(from) => {
                  send({ type: 'USE_SLIPPAGE', getSlippageFrom: from })
                }}
              />
            </Grid>
          }
          primaryButton={{
            isLoading: loading(),
            disabled: !state.can('ADJUST_POSITION') || isLocked(state) || !state.context.transition,
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
          dropdown={dropdownConfig}
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
        <ManageAaveReviewingStateView
          state={state}
          send={send}
          dropdownConfig={dropdownConfig}
          automation={{
            stopLoss: {
              stopLossError,
            },
          }}
        />
      )
    case state.matches('frontend.txInProgress'):
      return <ManageAaveTransactionInProgressStateView state={state} send={send} />
    case state.matches('frontend.txFailure'):
      return <ManageAaveFailureStateView state={state} send={send} />
    case state.matches('frontend.txSuccess') &&
      (state.context.transition?.transaction.operationName ===
        OPERATION_NAMES.aave.v2.CLOSE_POSITION ||
        state.context.transition?.transaction.operationName ===
          OPERATION_NAMES.aave.v3.CLOSE_POSITION):
      return <ManageAaveSuccessClosePositionStateView state={state} send={send} />
    case state.matches('frontend.txSuccess'):
      return <ManageAaveSuccessAdjustPositionStateView state={state} send={send} />
    default: {
      return <></>
    }
  }
}
