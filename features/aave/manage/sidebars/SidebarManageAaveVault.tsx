import { Icon } from '@makerdao/dai-ui-icons'
import {
  IPosition,
  ISimplePositionTransition,
  ISimulatedTransition,
  IStrategy,
  OPERATION_NAMES,
  PositionTransition,
} from '@oasisdex/dma-library'
import { useActor } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { amountFromWei } from 'blockchain/utils'
import { ActionPills } from 'components/ActionPills'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { MessageCard } from 'components/MessageCard'
import { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { SidebarSectionHeaderSelectItem } from 'components/sidebar/SidebarSectionHeaderSelect'
import { Skeleton } from 'components/Skeleton'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave'
import { ConnectedSidebarSection, StrategyInformationContainer } from 'features/aave/components'
import { StopLossAaveErrorMessage } from 'features/aave/components/StopLossAaveErrorMessage'
import { useManageAaveStateMachineContext } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import {
  ManageAaveContext,
  ManageAaveEvent,
  ManageAaveStateMachineState,
} from 'features/aave/manage/state'
import { isAllowanceNeeded, ManagePositionAvailableActions, ProductType } from 'features/aave/types'
import { AllowanceView } from 'features/stateMachines/allowance'
import { allDefined } from 'helpers/allDefined'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { getAaveStrategyUrl } from 'helpers/getAaveStrategyUrl'
import { handleNumericInput } from 'helpers/input'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import { curry } from 'ramda'
import React, { useEffect } from 'react'
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

function transitionHasSwap(
  transition?: ISimplePositionTransition | PositionTransition | IStrategy,
): transition is PositionTransition {
  return !!transition && (transition.simulation as ISimulatedTransition).swap !== undefined
}

function getAmountReceivedAfterClose(
  strategy:
    | PositionTransition
    | ISimplePositionTransition
    | PositionTransition
    | IStrategy
    | undefined,
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

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
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

function ManageAaveSaveSwitchFailureStateView({ state, send }: ManageAaveStateProps) {
  const productType = state.context.strategyConfig.type
  useEffect(() => {
    if (productType === 'Borrow') {
      send({ type: 'RETRY_BORROW_SWITCH' })
    } else if (productType === 'Multiply') {
      send({ type: 'RETRY_MULTIPLY_SWITCH' })
    } else if (productType === 'Earn') {
      send({ type: 'RETRY_EARN_SWITCH' })
    }
  }, [productType])

  return null
}

function ManageAaveSwitchingStateView({ state }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.switching-title', {
      type: state.context.strategyConfig.type,
    }),
    content: (
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('manage-earn.aave.vault-form.switching-description')}
      </Text>
    ),
    primaryButton: {
      isLoading: true,
      disabled: true,
      label: t('manage-earn.aave.vault-form.confirm-btn'),
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
}

function ManageAaveSwitchStateView({
  state,
  send,
  productType,
}: ManageAaveStateProps & { productType: ProductType }) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.confirm-switch', { type: productType }),
    content: (
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('manage-earn.aave.vault-form.switch-description', { productType })}
      </Text>
    ),
    primaryButton: {
      isLoading: false,
      disabled: false,
      label: t('manage-earn.aave.vault-form.confirm-btn'),
      action: () => send({ type: 'SWITCH_CONFIRMED', productType: productType }),
    },
    textButton: textButtonReturningToAdjust({ state, send }).textButton,
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
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
  const stopLossError = automation?.stopLoss?.stopLossError

  const label = allowanceNeeded
    ? t('set-allowance-for', {
        token: state.context.transactionToken || state.context.strategyConfig.tokens.deposit,
      })
    : t('manage-earn.aave.vault-form.confirm-btn')

  const sidebarSectionProps: SidebarSectionProps = {
    ...GetReviewingSidebarProps({ state, send, automation }),
    primaryButton: {
      isLoading: false,
      disabled: !state.can('NEXT_STEP') || isLocked(state) || stopLossError,
      label: label,
      action: () => send('NEXT_STEP'),
    },
    textButton: textButtonReturningToAdjust({ state, send }).textButton,
    dropdown: dropdownConfig,
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
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

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
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

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
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
        network: state.context.strategyConfig.network,
      }),
    },
  }

  return <ConnectedSidebarSection {...sidebarSectionProps} context={state.context} />
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
    'switch-to-borrow': {
      label: t('system.actions.multiply.switch-to-borrow'),
      icon: 'circle_close',
      panel: 'confirmSwitch',
      action: () => {
        send('SWITCH_TO_BORROW')
      },
    },
    'switch-to-multiply': {
      label: t('system.actions.borrow.switch-to-multiply'),
      icon: 'circle_close',
      panel: 'confirmSwitch',
      action: () => {
        send('SWITCH_TO_MULTIPLY')
      },
    },
    'switch-to-earn': {
      label: t('system.actions.borrow.switch-to-earn'),
      icon: 'circle_close',
      panel: 'confirmSwitch',
      action: () => {
        send('SWITCH_TO_EARN')
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

  function loading(): boolean {
    return isLoading(state)
  }

  const stopLossError =
    isStopLossEnabled &&
    ((state.context.transition?.simulation?.position.riskRatio.loanToValue.gte(stopLossLevel) &&
      !loading()) ||
      state.context.userInput.riskRatio?.loanToValue.gte(stopLossLevel))

  const dropdownConfig = getDropdownConfig({ state, send })

  const AdjustRisk = state.context.strategyConfig.viewComponents.adjustRiskInput

  switch (true) {
    case state.matches('frontend.editing'):
      return (
        <ConnectedSidebarSection
          title={
            state.context.strategyConfig.type === 'Earn'
              ? t('manage-earn.aave.vault-form.manage-title')
              : t('manage-multiply.sidebar.title')
          }
          content={
            <Grid gap={3}>
              <AdjustRisk
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
            disabled:
              !state.can('ADJUST_POSITION') ||
              isLocked(state) ||
              !state.context.transition ||
              stopLossError,
            label: t('manage-earn.aave.vault-form.adjust-risk'),
            action: () => {
              send('ADJUST_POSITION')
            },
          }}
          dropdown={dropdownConfig}
          context={state.context}
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
    case state.matches('frontend.savePositionToDb'):
    case state.matches('frontend.switching'):
      return <ManageAaveSwitchingStateView state={state} send={send} />
    case state.matches('frontend.saveSwitchFailure'):
      return <ManageAaveSaveSwitchFailureStateView state={state} send={send} />
    case state.matches('frontend.switchToBorrow'):
      return (
        <ManageAaveSwitchStateView state={state} send={send} productType={ProductType.Borrow} />
      )
    case state.matches('frontend.switchToMultiply'):
      return (
        <ManageAaveSwitchStateView state={state} send={send} productType={ProductType.Multiply} />
      )
    case state.matches('frontend.switchToEarn'):
      return <ManageAaveSwitchStateView state={state} send={send} productType={ProductType.Earn} />
    case state.matches('frontend.txInProgress'):
    case state.matches('frontend.txInProgressEthers'):
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
