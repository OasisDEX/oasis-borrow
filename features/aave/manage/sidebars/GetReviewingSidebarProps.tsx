import type BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { ActionPills } from 'components/ActionPills'
import { MessageCard } from 'components/MessageCard'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { StopLossAaveErrorMessage, StrategyInformationContainer } from 'features/aave/components'
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
