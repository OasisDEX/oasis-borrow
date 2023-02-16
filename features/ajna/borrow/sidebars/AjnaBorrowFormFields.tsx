import { VaultActionInput } from 'components/vault/VaultActionInput'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface AjnaBorrowFormField {
  isDisabled?: boolean
  resetOnClear?: boolean
}

export function AjnaBorrowFormFieldWithdraw({ isDisabled, resetOnClear }: AjnaBorrowFormField) {
  const {
    form: {
      dispatch,
      state: { withdrawAmount, withdrawAmountUSD },
    },
    environment: { collateralPrice, collateralToken },
  } = useAjnaBorrowContext()

  return (
    <VaultActionInput
      action="Withdraw"
      currencyCode={collateralToken}
      tokenUsdPrice={collateralPrice}
      amount={withdrawAmount}
      auxiliaryAmount={withdrawAmountUSD}
      hasAuxiliary={true}
      hasError={false}
      disabled={isDisabled}
      onChange={handleNumericInput((n) => {
        dispatch({
          type: 'update-withdraw',
          withdrawAmount: n,
          withdrawAmountUSD: n?.times(collateralPrice),
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onAuxiliaryChange={handleNumericInput((n) => {
        dispatch({
          type: 'update-withdraw',
          withdrawAmount: n?.dividedBy(collateralPrice),
          withdrawAmountUSD: n,
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
    />
  )
}

export function AjnaBorrowFormFieldGenerate({ isDisabled, resetOnClear }: AjnaBorrowFormField) {
  const {
    form: {
      dispatch,
      state: { generateAmount, generateAmountUSD },
    },
    environment: { quotePrice, quoteToken },
  } = useAjnaBorrowContext()

  return (
    <VaultActionInput
      action="Generate"
      currencyCode={quoteToken}
      tokenUsdPrice={quotePrice}
      amount={generateAmount}
      auxiliaryAmount={generateAmountUSD}
      hasAuxiliary={true}
      hasError={false}
      disabled={isDisabled}
      onChange={handleNumericInput((n) => {
        dispatch({
          type: 'update-generate',
          generateAmount: n,
          generateAmountUSD: n?.times(quotePrice),
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onAuxiliaryChange={handleNumericInput((n) => {
        dispatch({
          type: 'update-generate',
          generateAmount: n?.dividedBy(quotePrice),
          generateAmountUSD: n,
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
    />
  )
}

export function AjnaBorrowFormFieldPayback({ isDisabled, resetOnClear }: AjnaBorrowFormField) {
  const { t } = useTranslation()
  const {
    form: {
      dispatch,
      state: { paybackAmount, paybackAmountUSD },
    },
    environment: { quoteBalance, quotePrice, quoteToken },
  } = useAjnaBorrowContext()

  return (
    <VaultActionInput
      action="Payback"
      currencyCode={quoteToken}
      tokenUsdPrice={quotePrice}
      amount={paybackAmount}
      auxiliaryAmount={paybackAmountUSD}
      hasAuxiliary={true}
      hasError={false}
      disabled={isDisabled}
      showMax={true}
      // TODO: should be quoteBalance or total debt, whatever is lower, but debt is not yet available
      maxAmount={quoteBalance}
      maxAuxiliaryAmount={quoteBalance.times(quotePrice)}
      maxAmountLabel={t('balance')}
      onChange={handleNumericInput((n) => {
        dispatch({
          type: 'update-payback',
          paybackAmount: n,
          paybackAmountUSD: n?.times(quotePrice),
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onAuxiliaryChange={handleNumericInput((n) => {
        dispatch({
          type: 'update-payback',
          paybackAmount: n?.dividedBy(quotePrice),
          paybackAmountUSD: n,
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onSetMax={() => {
        dispatch({
          type: 'update-payback',
          paybackAmount: quoteBalance,
          paybackAmountUSD: quoteBalance.times(quotePrice),
        })
      }}
    />
  )
}
