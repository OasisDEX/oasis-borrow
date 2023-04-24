import BigNumber from 'bignumber.js'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import {
  AjnaFormActionsUpdateDeposit,
  AjnaFormActionsUpdateGenerate,
  AjnaFormActionsUpdatePayback,
  AjnaFormActionsUpdateWithdraw,
} from 'features/ajna/positions/common/state/ajnaFormReductoActions'
import { handleNumericInput } from 'helpers/input'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { Dispatch } from 'react'

interface AjnaFormField<D> {
  dispatchAmount: Dispatch<D & { [key: string]: string | number | BigNumber | undefined }>
  isDisabled?: boolean
  resetOnClear?: boolean
}

interface AjnaFormFieldWithDefinedToken {
  token: string
  tokenPrice: BigNumber
}

interface AjnaFormFieldWithMinAmount {
  minAmount?: BigNumber
  minAmountLabel?: string
}

interface AjnaFormFieldWithMaxAmount {
  maxAmount?: BigNumber
  maxAmountLabel?: string
}

export function AjnaFormFieldDeposit({
  dispatchAmount,
  isDisabled,
  maxAmount,
  maxAmountLabel = 'balance',
  resetOnClear,
  token,
  tokenPrice,
}: AjnaFormField<AjnaFormActionsUpdateDeposit> &
  AjnaFormFieldWithDefinedToken &
  AjnaFormFieldWithMaxAmount) {
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
      maxAmount={maxAmount}
      maxAuxiliaryAmount={maxAmount?.times(tokenPrice)}
      maxAmountLabel={t(maxAmountLabel)}
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
          depositAmount: maxAmount,
          depositAmountUSD: maxAmount?.times(tokenPrice),
        })
      }}
    />
  ) : null
}

export function AjnaFormFieldGenerate({
  dispatchAmount,
  isDisabled,
  maxAmount,
  maxAmountLabel = 'max',
  minAmount,
  minAmountLabel = 'field-from',
  resetOnClear,
}: AjnaFormField<AjnaFormActionsUpdateGenerate> &
  AjnaFormFieldWithMinAmount &
  AjnaFormFieldWithMaxAmount) {
  const { t } = useTranslation()
  const {
    environment: { product, quotePrice, quoteToken },
  } = useAjnaGeneralContext()
  const {
    form: { dispatch, state },
  } = useAjnaProductContext(product)

  return 'generateAmount' in state && 'generateAmountUSD' in state ? (
    <VaultActionInput
      action="Borrow"
      currencyCode={quoteToken}
      tokenUsdPrice={quotePrice}
      amount={state.generateAmount}
      auxiliaryAmount={state.generateAmountUSD}
      hasAuxiliary={true}
      hasError={false}
      disabled={isDisabled}
      showMin={minAmount?.gt(zero)}
      minAmount={minAmount}
      minAmountLabel={t(minAmountLabel)}
      minAuxiliaryAmount={minAmount?.times(quotePrice)}
      showMax={maxAmount?.gt(zero)}
      maxAmount={maxAmount}
      maxAmountLabel={t(maxAmountLabel)}
      maxAuxiliaryAmount={maxAmount?.times(quotePrice)}
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
      onSetMin={() => {
        dispatchAmount({
          type: 'update-generate',
          generateAmount: minAmount,
          generateAmountUSD: minAmount?.times(quotePrice),
        })
      }}
      onSetMax={() => {
        dispatchAmount({
          type: 'update-generate',
          generateAmount: maxAmount,
          generateAmountUSD: maxAmount?.times(quotePrice),
        })
      }}
    />
  ) : null
}

export function AjnaFormFieldPayback({
  dispatchAmount,
  isDisabled,
  maxAmount,
  maxAmountLabel = 'max',
  resetOnClear,
}: AjnaFormField<AjnaFormActionsUpdatePayback> & AjnaFormFieldWithMaxAmount) {
  const { t } = useTranslation()
  const {
    environment: { quotePrice, quoteToken, product },
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
      maxAmount={maxAmount}
      maxAuxiliaryAmount={maxAmount?.times(quotePrice)}
      maxAmountLabel={t(maxAmountLabel)}
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
          paybackAmount: maxAmount,
          paybackAmountUSD: maxAmount?.times(quotePrice),
        })
      }}
    />
  ) : null
}

export function AjnaFormFieldWithdraw({
  dispatchAmount,
  isDisabled,
  maxAmount,
  maxAmountLabel = 'max',
  resetOnClear,
  token,
  tokenPrice,
}: AjnaFormField<AjnaFormActionsUpdateWithdraw> &
  AjnaFormFieldWithDefinedToken &
  AjnaFormFieldWithMaxAmount) {
  const { t } = useTranslation()

  const {
    environment: { product },
  } = useAjnaGeneralContext()
  const {
    form: { dispatch, state },
  } = useAjnaProductContext(product)

  return 'withdrawAmount' in state && 'withdrawAmountUSD' in state ? (
    <VaultActionInput
      action="Withdraw"
      currencyCode={token}
      tokenUsdPrice={tokenPrice}
      amount={state.withdrawAmount}
      auxiliaryAmount={state.withdrawAmountUSD}
      hasAuxiliary={true}
      hasError={false}
      disabled={isDisabled}
      showMax={maxAmount?.gt(zero)}
      maxAmount={maxAmount}
      maxAmountLabel={t(maxAmountLabel)}
      maxAuxiliaryAmount={maxAmount?.times(tokenPrice)}
      onChange={handleNumericInput((n) => {
        dispatchAmount({
          type: 'update-withdraw',
          withdrawAmount: n,
          withdrawAmountUSD: n?.times(tokenPrice),
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onAuxiliaryChange={handleNumericInput((n) => {
        dispatchAmount({
          type: 'update-withdraw',
          withdrawAmount: n?.dividedBy(tokenPrice),
          withdrawAmountUSD: n,
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onSetMax={() => {
        dispatchAmount({
          type: 'update-withdraw',
          withdrawAmount: maxAmount,
          withdrawAmountUSD: maxAmount?.times(tokenPrice),
        })
      }}
    />
  ) : null
}
