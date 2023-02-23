import BigNumber from 'bignumber.js'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import {
  AjnaFormActionsUpdateDeposit,
  AjnaFormActionsUpdateGenerate,
  AjnaFormActionsUpdatePayback,
  AjnaFormActionsUpdateWithdraw,
} from 'features/ajna/common/state/ajnaFormReductoActions'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React, { Dispatch } from 'react'

interface AjnaFormField<D> {
  dispatchAmount: Dispatch<D & { [key: string]: string | number | BigNumber | undefined }>
  isDisabled?: boolean
  resetOnClear?: boolean
}

interface AjnaFormFieldDepositProps<D> extends AjnaFormField<D> {
  token: string
  tokenPrice: BigNumber
  tokenBalance: BigNumber
}

export function AjnaFormFieldDeposit({
  token,
  tokenPrice,
  tokenBalance,
  dispatchAmount,
  isDisabled,
  resetOnClear,
}: AjnaFormFieldDepositProps<AjnaFormActionsUpdateDeposit>) {
  const { t } = useTranslation()
  const {
    environment: { product },
  } = useAjnaGeneralContext()
  const {
    form: { dispatch, state },
  } = useAjnaProductContext(product)

  return 'depositAmount' in state && 'depositAmountUSD' in state ? (
    <VaultActionInput
      action="Deposit"
      currencyCode={token}
      tokenUsdPrice={tokenPrice}
      amount={state.depositAmount}
      auxiliaryAmount={state.depositAmountUSD}
      hasAuxiliary={true}
      hasError={false}
      disabled={isDisabled}
      showMax={true}
      maxAmount={tokenBalance}
      maxAuxiliaryAmount={tokenBalance.times(tokenPrice)}
      maxAmountLabel={t('balance')}
      onChange={handleNumericInput((n) => {
        dispatchAmount({
          type: 'update-deposit',
          depositAmount: n,
          depositAmountUSD: n?.times(tokenPrice),
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onAuxiliaryChange={handleNumericInput((n) => {
        dispatchAmount({
          type: 'update-deposit',
          depositAmount: n?.dividedBy(tokenPrice),
          depositAmountUSD: n,
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onSetMax={() => {
        dispatchAmount({
          type: 'update-deposit',
          depositAmount: tokenBalance,
          depositAmountUSD: tokenBalance.times(tokenPrice),
        })
      }}
    />
  ) : null
}

export function AjnaFormFieldGenerate({
  dispatchAmount,
  isDisabled,
  resetOnClear,
}: AjnaFormField<AjnaFormActionsUpdateGenerate>) {
  const {
    environment: { product, quotePrice, quoteToken },
  } = useAjnaGeneralContext()
  const {
    form: { dispatch, state },
  } = useAjnaProductContext(product)

  return 'generateAmount' in state && 'generateAmountUSD' in state ? (
    <VaultActionInput
      action="Generate"
      currencyCode={quoteToken}
      tokenUsdPrice={quotePrice}
      amount={state.generateAmount}
      auxiliaryAmount={state.generateAmountUSD}
      hasAuxiliary={true}
      hasError={false}
      disabled={isDisabled}
      onChange={handleNumericInput((n) => {
        dispatchAmount({
          type: 'update-generate',
          generateAmount: n,
          generateAmountUSD: n?.times(quotePrice),
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onAuxiliaryChange={handleNumericInput((n) => {
        dispatchAmount({
          type: 'update-generate',
          generateAmount: n?.dividedBy(quotePrice),
          generateAmountUSD: n,
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
    />
  ) : null
}

export function AjnaFormFieldPayback({
  dispatchAmount,
  isDisabled,
  resetOnClear,
}: AjnaFormField<AjnaFormActionsUpdatePayback>) {
  const { t } = useTranslation()
  const {
    environment: { quoteBalance, quotePrice, quoteToken, product },
  } = useAjnaGeneralContext()
  const {
    form: { dispatch, state },
  } = useAjnaProductContext(product)

  return 'paybackAmount' in state && 'paybackAmountUSD' in state ? (
    <VaultActionInput
      action="Payback"
      currencyCode={quoteToken}
      tokenUsdPrice={quotePrice}
      amount={state.paybackAmount}
      auxiliaryAmount={state.paybackAmountUSD}
      hasAuxiliary={true}
      hasError={false}
      disabled={isDisabled}
      showMax={true}
      // TODO: should be quoteBalance or total debt, whatever is lower, but debt is not yet available
      maxAmount={quoteBalance}
      maxAuxiliaryAmount={quoteBalance.times(quotePrice)}
      maxAmountLabel={t('balance')}
      onChange={handleNumericInput((n) => {
        dispatchAmount({
          type: 'update-payback',
          paybackAmount: n,
          paybackAmountUSD: n?.times(quotePrice),
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onAuxiliaryChange={handleNumericInput((n) => {
        dispatchAmount({
          type: 'update-payback',
          paybackAmount: n?.dividedBy(quotePrice),
          paybackAmountUSD: n,
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onSetMax={() => {
        dispatchAmount({
          type: 'update-payback',
          paybackAmount: quoteBalance,
          paybackAmountUSD: quoteBalance.times(quotePrice),
        })
      }}
    />
  ) : null
}

export function AjnaFormFieldWithdraw({
  dispatchAmount,
  isDisabled,
  resetOnClear,
}: AjnaFormField<AjnaFormActionsUpdateWithdraw>) {
  const {
    environment: { collateralPrice, collateralToken, product },
  } = useAjnaGeneralContext()
  const {
    form: { dispatch, state },
  } = useAjnaProductContext(product)

  return 'withdrawAmount' in state && 'withdrawAmountUSD' in state ? (
    <VaultActionInput
      action="Withdraw"
      currencyCode={collateralToken}
      tokenUsdPrice={collateralPrice}
      amount={state.withdrawAmount}
      auxiliaryAmount={state.withdrawAmountUSD}
      hasAuxiliary={true}
      hasError={false}
      disabled={isDisabled}
      onChange={handleNumericInput((n) => {
        dispatchAmount({
          type: 'update-withdraw',
          withdrawAmount: n,
          withdrawAmountUSD: n?.times(collateralPrice),
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onAuxiliaryChange={handleNumericInput((n) => {
        dispatchAmount({
          type: 'update-withdraw',
          withdrawAmount: n?.dividedBy(collateralPrice),
          withdrawAmountUSD: n,
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
    />
  ) : null
}
