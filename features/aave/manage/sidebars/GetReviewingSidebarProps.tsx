import type BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { ActionPills } from 'components/ActionPills'
import { MessageCard } from 'components/MessageCard'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import {
  ErrorMessageCannotBorrowDueToProtocolCap,
  ErrorMessageCannotDepositDueToProtocolCap,
  StopLossAaveErrorMessage,
  StrategyInformationContainer,
} from 'features/aave/components'
import {
  getCollateralInputValue,
  getDebtInputValue,
} from 'features/aave/helpers/manage-inputs-helpers'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import { curry } from 'ramda'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import type { ManageAaveStateProps } from './SidebarManageAaveVault'
import {
  BalanceAfterClose,
  calculateMaxCollateralAmount,
  calculateMaxDebtAmount,
} from './SidebarManageAaveVault'

export function GetReviewingSidebarProps({
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
  const updateInput1ActionValue = (manageInput1Value?: BigNumber) => {
    send({ type: 'UPDATE_INPUT1_ACTION_VALUE', manageInput1Value })
  }
  const updateInput2ActionValue = (manageInput2Value?: BigNumber) => {
    send({ type: 'UPDATE_INPUT2_ACTION_VALUE', manageInput2Value })
  }

  const closeToToken = state.context.manageTokenInput?.closingToken
  const maxCollateralAmount = calculateMaxCollateralAmount(state.context)
  const maxDebtAmount = calculateMaxDebtAmount(state.context)

  const amountCollateralTooHigh = maxCollateralAmount.lt(
    getCollateralInputValue(state.context) || zero,
  )
  const amountDebtTooHigh = maxDebtAmount.lt(getDebtInputValue(state.context) || zero)

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
      const isDeposit =
        state.context.manageTokenInput?.manageAction ===
        ManageCollateralActionsEnum.DEPOSIT_COLLATERAL
      const isWithdraw =
        state.context.manageTokenInput?.manageAction ===
        ManageCollateralActionsEnum.WITHDRAW_COLLATERAL

      return {
        title: t('system.manage-collateral'),
        content: (
          <Grid gap={3}>
            <ActionPills
              active={state.context.manageTokenInput?.manageAction!}
              items={Object.values(ManageCollateralActionsEnum).map((action) => ({
                id: action,
                label: t(`system.actions.multiply.${action}`),
                action: () => curry(updateCollateralTokenAction)(action),
              }))}
            />
            <VaultActionInput
              action={isDeposit ? 'Deposit' : 'Withdraw'}
              currencyCode={collateral}
              currencyDigits={getToken(collateral).digits}
              maxAmountLabel={isDeposit ? t('balance') : t('max')}
              maxAmount={maxCollateralAmount}
              showMax={true}
              onSetMax={() => {
                updateInput1ActionValue(maxCollateralAmount)
              }}
              amount={state.context.manageTokenInput?.manageInput1Value}
              onChange={handleNumericInput(updateInput1ActionValue)}
              hasError={false}
            />
            <VaultActionInput
              action={isDeposit ? 'Borrow' : 'Payback'}
              currencyCode={debt}
              currencyDigits={getToken(debt).digits}
              maxAmountLabel={isDeposit ? t('max') : t('balance')}
              maxAmount={maxDebtAmount}
              showMax={true}
              onSetMax={() => {
                updateInput2ActionValue(maxDebtAmount)
              }}
              amount={state.context.manageTokenInput?.manageInput2Value}
              onChange={handleNumericInput(updateInput2ActionValue)}
              hasError={false}
            />
            {stopLossError && <StopLossAaveErrorMessage />}
            {amountCollateralTooHigh && (
              <>
                <MessageCard
                  messages={
                    isWithdraw
                      ? [
                          t('vault-errors.withdraw-amount-exceeds-free-collateral', {
                            maxWithdrawAmount: formatCryptoBalance(maxCollateralAmount),
                            token: state.context.tokens.collateral,
                          }),
                        ]
                      : [t('vault-errors.deposit-amount-exceeds-collateral-balance')]
                  }
                  type="error"
                  withBullet={false}
                />
                <ErrorMessageCannotDepositDueToProtocolCap context={state.context} />
              </>
            )}
            {amountDebtTooHigh && (
              <>
                <MessageCard
                  messages={
                    isWithdraw
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
                  withBullet={false}
                />
                <ErrorMessageCannotDepositDueToProtocolCap context={state.context} />
              </>
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
      const isPayback =
        state.context.manageTokenInput?.manageAction === ManageDebtActionsEnum.PAYBACK_DEBT
      const isBorrow =
        state.context.manageTokenInput?.manageAction === ManageDebtActionsEnum.BORROW_DEBT

      return {
        title: t('system.manage-debt'),
        content: (
          <Grid gap={3}>
            <ActionPills
              active={state.context.manageTokenInput?.manageAction!}
              items={Object.values(ManageDebtActionsEnum).map((action) => ({
                id: action,
                label: t(`system.actions.multiply.${action}`),
                action: () => curry(updateDebtTokenAction)(action),
              }))}
            />
            <VaultActionInput
              action={isBorrow ? 'Borrow' : 'Payback'}
              currencyCode={debt}
              currencyDigits={getToken(debt).digits}
              maxAmountLabel={isPayback ? t('balance') : t('max')}
              maxAmount={maxDebtAmount}
              showMax={true}
              onSetMax={() => {
                updateInput1ActionValue(maxDebtAmount)
              }}
              amount={state.context.manageTokenInput?.manageInput1Value}
              onChange={handleNumericInput(updateInput1ActionValue)}
              hasError={false}
            />
            <VaultActionInput
              action={isBorrow ? 'Deposit' : 'Withdraw'}
              currencyCode={collateral}
              currencyDigits={getToken(collateral).digits}
              maxAmountLabel={isPayback ? t('max') : t('balance')}
              maxAmount={maxCollateralAmount}
              showMax={true}
              onSetMax={() => {
                updateInput2ActionValue(maxCollateralAmount)
              }}
              amount={state.context.manageTokenInput?.manageInput2Value}
              onChange={handleNumericInput(updateInput2ActionValue)}
              hasError={false}
            />
            {stopLossError && <StopLossAaveErrorMessage />}
            {amountDebtTooHigh && (
              <>
                <MessageCard
                  messages={
                    isPayback
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
                  withBullet={false}
                />
                <ErrorMessageCannotBorrowDueToProtocolCap context={state.context} />
              </>
            )}
            {amountCollateralTooHigh && (
              <>
                <MessageCard
                  messages={
                    isPayback
                      ? [
                          t('vault-errors.withdraw-amount-exceeds-free-collateral', {
                            maxWithdrawAmount: formatCryptoBalance(maxCollateralAmount),
                            token: state.context.tokens.collateral,
                          }),
                        ]
                      : [t('vault-errors.deposit-amount-exceeds-collateral-balance')]
                  }
                  type="error"
                  withBullet={false}
                />
                <ErrorMessageCannotDepositDueToProtocolCap context={state.context} />
              </>
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
