import { Icon } from '@makerdao/dai-ui-icons'
import type { IMultiplyStrategy, IPosition, IStrategy } from '@oasisdex/dma-library'
import { OPERATION_NAMES } from '@oasisdex/dma-library'
import { useActor } from '@xstate/react'
import type BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { amountFromWei } from 'blockchain/utils'
import { useAutomationContext } from 'components/context'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import type { SidebarSectionHeaderSelectItem } from 'components/sidebar/SidebarSectionHeaderSelect'
import { Skeleton } from 'components/Skeleton'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave'
import { ConnectedSidebarSection, StrategyInformationContainer } from 'features/aave/components'
import { useManageAaveStateMachineContext } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import type {
  ManageAaveContext,
  ManageAaveEvent,
  ManageAaveStateMachineState,
} from 'features/aave/manage/state'
import type { ManagePositionAvailableActions } from 'features/aave/types'
import { ProductType } from 'features/aave/types'
import { AllowanceView } from 'features/stateMachines/allowance'
import { allDefined } from 'helpers/allDefined'
import { getLocalAppConfig } from 'helpers/config'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { getAaveLikeOpenStrategyUrl } from 'helpers/getAaveLikeStrategyUrl'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'
import { match } from 'ts-pattern'
import type { Sender } from 'xstate'

import { GetReviewingSidebarProps } from './GetReviewingSidebarProps'
import { ManageAaveReviewingStateView } from './ManageAaveReviewingStateView'

export interface ManageAaveAutomation {
  stopLoss: {
    isStopLossEnabled?: boolean
    stopLossLevel?: BigNumber
    stopLossError?: boolean
  }
}

export interface ManageAaveStateProps {
  readonly state: ManageAaveStateMachineState
  readonly send: Sender<ManageAaveEvent>
  readonly automation?: ManageAaveAutomation
}

export type WithDropdownConfig<T> = T & { dropdownConfig?: SidebarSectionHeaderDropdown }

export function isLoading(state: ManageAaveStateMachineState) {
  return (
    state.matches('background.loading') ||
    state.matches('background.debouncing') ||
    state.matches('background.debouncingManage') ||
    state.matches('background.loadingManage')
  )
}

export function isLocked(state: ManageAaveStateMachineState) {
  const { ownerAddress, web3Context, tokens, strategyConfig, manageTokenInput } = state.context
  const isClosing = state.matches('frontend.reviewingClosing')
  const isAdjusting = state.matches('frontend.reviewingAdjusting')
  const { aaveLike } = getLocalAppConfig('parameters')
  if (isClosing) {
    if (
      // TODO: find a better way to handle this
      aaveLike.closeDisabledFor.strategyTypes.includes(strategyConfig.strategyType) &&
      aaveLike.closeDisabledFor.collateral.includes(manageTokenInput?.closingToken || '')
    )
      return true
  }
  if (isAdjusting) {
    if (
      aaveLike.adjustDisabledFor.strategyTypes.includes(strategyConfig.strategyType) &&
      aaveLike.adjustDisabledFor.collateral.includes(tokens.collateral)
    ) {
      return true
    }
  }
  return !(allDefined(ownerAddress, web3Context) && ownerAddress === web3Context!.account)
}

export function textButtonReturningToAdjust({
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

export function transitionHasSwap(
  transition?: IMultiplyStrategy | IStrategy,
): transition is IMultiplyStrategy {
  return (
    !!transition && (transition.simulation as IMultiplyStrategy['simulation']).swap !== undefined
  )
}

export function getAmountReceivedAfterClose(
  strategy: IStrategy | undefined,
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

export function BalanceAfterClose({ state }: ManageAaveStateProps) {
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

export function calculateMaxDebtAmount(context: ManageAaveContext): BigNumber {
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

export function calculateMaxCollateralAmount(context: ManageAaveContext): BigNumber {
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

export function ManageAaveSaveSwitchFailureStateView({ state, send }: ManageAaveStateProps) {
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

export function ManageAaveSwitchingStateView({ state }: ManageAaveStateProps) {
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

export function ManageAaveSwitchStateView({
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
      url: getAaveLikeOpenStrategyUrl({
        aaveLikeProduct:
          state.context.strategyConfig.protocol === LendingProtocol.SparkV3 ? 'spark' : 'aave',
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

  const strategyAvailableActions = state.context.strategyConfig
    .availableActions()
    .map((action) => itemPerAction[action])

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

  const title = match<ProductType, string>(state.context.strategyConfig.type)
    .with(ProductType.Earn, () => t('manage-earn.aave.vault-form.manage-title'))
    .with(ProductType.Multiply, () => t('manage-multiply.sidebar.title'))
    .with(ProductType.Borrow, () => t('manage-borrow.sidebar.title'))
    .exhaustive()

  switch (true) {
    case state.matches('frontend.editing'):
      return (
        <ConnectedSidebarSection
          title={title}
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
