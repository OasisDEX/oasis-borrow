import type BigNumber from 'bignumber.js'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import type {
  FormActionsUpdateDeposit,
  FormActionsUpdateGenerate,
  FormActionsUpdatePayback,
  FormActionsUpdatePaybackMax,
  FormActionsUpdateWithdraw,
} from 'features/omni-kit/state'
import { handleNumericInput } from 'helpers/input'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { Dispatch } from 'react'
import React from 'react'

interface OmniFormField<D> {
  dispatchAmount: Dispatch<D>
  isDisabled?: boolean
  resetOnClear?: boolean
}

interface OmniFormFieldWithDefinedToken {
  token: string
  tokenDigits?: number
  tokenPrice: BigNumber
}

interface OmniFormFieldWithMinAmount {
  minAmount?: BigNumber
  minAmountLabel?: string
}

interface OmniFormFieldWithMaxAmount {
  maxAmount?: BigNumber
  maxAmountLabel?: string
}

export function OmniFormFieldDeposit({
  dispatchAmount,
  isDisabled,
  maxAmount,
  maxAmountLabel = 'balance',
  resetOnClear,
  token,
  tokenDigits,
  tokenPrice,
}: OmniFormField<FormActionsUpdateDeposit> &
  OmniFormFieldWithDefinedToken &
  OmniFormFieldWithMaxAmount) {
  const { t } = useTranslation()
  const {
    environment: { isOracless, product },
  } = useOmniGeneralContext()
  const {
    form: { dispatch, state },
    dynamicMetadata,
  } = useOmniProductContext(product)

  const {
    validations: { isFormFrozen },
  } = dynamicMetadata

  return 'depositAmount' in state && 'depositAmountUSD' in state ? (
    <VaultActionInput
      action="Deposit"
      currencyCode={token}
      currencyDigits={tokenDigits}
      tokenUsdPrice={tokenPrice}
      amount={state.depositAmount}
      auxiliaryAmount={state.depositAmountUSD}
      hasAuxiliary={!isOracless}
      hasError={false}
      disabled={isDisabled || isFormFrozen}
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

export function OmniFormFieldGenerate({
  dispatchAmount,
  isDisabled,
  maxAmount,
  maxAmountLabel = 'max',
  minAmount,
  minAmountLabel = 'field-from',
  resetOnClear,
}: OmniFormField<FormActionsUpdateGenerate> &
  OmniFormFieldWithMinAmount &
  OmniFormFieldWithMaxAmount) {
  const { t } = useTranslation()
  const {
    environment: { isOracless, product, quoteDigits, quotePrice, quoteToken },
  } = useOmniGeneralContext()
  const {
    form: { dispatch, state },
    dynamicMetadata,
  } = useOmniProductContext(product)

  const {
    validations: { isFormFrozen },
  } = dynamicMetadata

  return 'generateAmount' in state && 'generateAmountUSD' in state ? (
    <VaultActionInput
      action="Borrow"
      currencyCode={quoteToken}
      currencyDigits={quoteDigits}
      tokenUsdPrice={quotePrice}
      amount={state.generateAmount}
      auxiliaryAmount={state.generateAmountUSD}
      hasAuxiliary={!isOracless}
      hasError={false}
      disabled={isDisabled || isFormFrozen}
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

export function OmniFormFieldPayback({
  dispatchAmount,
  isDisabled,
  maxAmount,
  maxAmountLabel = 'max',
  resetOnClear,
}: OmniFormField<FormActionsUpdatePayback | FormActionsUpdatePaybackMax> &
  OmniFormFieldWithMaxAmount) {
  const { t } = useTranslation()
  const {
    environment: { isOracless, quoteDigits, quotePrice, quoteToken, product },
  } = useOmniGeneralContext()
  const {
    form: { dispatch, state },
    dynamicMetadata,
  } = useOmniProductContext(product)

  const {
    validations: { isFormFrozen },
  } = dynamicMetadata

  return 'paybackAmount' in state && 'paybackAmountUSD' in state ? (
    <VaultActionInput
      action="Payback"
      currencyCode={quoteToken}
      currencyDigits={quoteDigits}
      tokenUsdPrice={quotePrice}
      amount={state.paybackAmount}
      auxiliaryAmount={state.paybackAmountUSD}
      hasAuxiliary={!isOracless}
      hasError={false}
      disabled={isDisabled || isFormFrozen}
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
        dispatchAmount({
          type: 'update-payback-max',
          paybackAmountMax: false,
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onAuxiliaryChange={handleNumericInput((n) => {
        dispatchAmount({
          type: 'update-payback',
          paybackAmount: n?.dividedBy(quotePrice),
          paybackAmountUSD: n,
        })
        dispatchAmount({
          type: 'update-payback-max',
          paybackAmountMax: false,
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onSetMax={() => {
        dispatchAmount({
          type: 'update-payback',
          paybackAmount: maxAmount,
          paybackAmountUSD: maxAmount?.times(quotePrice),
        })
        dispatchAmount({
          type: 'update-payback-max',
          paybackAmountMax: true,
        })
      }}
    />
  ) : null
}

export function OmniFormFieldWithdraw({
  dispatchAmount,
  isDisabled,
  maxAmount,
  maxAmountLabel = 'max',
  resetOnClear,
  token,
  tokenDigits,
  tokenPrice,
}: OmniFormField<FormActionsUpdateWithdraw> &
  OmniFormFieldWithDefinedToken &
  OmniFormFieldWithMaxAmount) {
  const { t } = useTranslation()

  const {
    environment: { isOracless, product },
  } = useOmniGeneralContext()
  const {
    form: { dispatch, state },
    dynamicMetadata,
  } = useOmniProductContext(product)

  const {
    validations: { isFormFrozen },
  } = dynamicMetadata

  return 'withdrawAmount' in state && 'withdrawAmountUSD' in state ? (
    <VaultActionInput
      action="Withdraw"
      currencyCode={token}
      currencyDigits={tokenDigits}
      tokenUsdPrice={tokenPrice}
      amount={state.withdrawAmount}
      auxiliaryAmount={state.withdrawAmountUSD}
      hasAuxiliary={!isOracless}
      hasError={false}
      disabled={isDisabled || isFormFrozen}
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
