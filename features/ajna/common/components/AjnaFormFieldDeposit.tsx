import BigNumber from 'bignumber.js'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { AjnaBorrowFormAction } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'

// TODO update types to accept earn dispatch
interface AjnaBorrowFormField {
  collateralToken: string
  collateralBalance: BigNumber
  collateralPrice: BigNumber
  dispatch: React.Dispatch<AjnaBorrowFormAction>
  isDisabled?: boolean
  resetOnClear?: boolean
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
}

export function AjnaFormFieldDeposit({
  isDisabled,
  resetOnClear,
  collateralToken,
  depositAmount,
  depositAmountUSD,
  collateralPrice,
  collateralBalance,
  dispatch,
}: AjnaBorrowFormField) {
  const { t } = useTranslation()

  return (
    <VaultActionInput
      action="Deposit"
      currencyCode={collateralToken}
      tokenUsdPrice={collateralPrice}
      amount={depositAmount}
      auxiliaryAmount={depositAmountUSD}
      hasAuxiliary={true}
      hasError={false}
      disabled={isDisabled}
      showMax={true}
      maxAmount={collateralBalance}
      maxAuxiliaryAmount={collateralBalance.times(collateralPrice)}
      maxAmountLabel={t('balance')}
      onChange={handleNumericInput((n) => {
        dispatch({
          type: 'update-deposit',
          depositAmount: n,
          depositAmountUSD: n?.times(collateralPrice),
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onAuxiliaryChange={handleNumericInput((n) => {
        dispatch({
          type: 'update-deposit',
          depositAmount: n?.dividedBy(collateralPrice),
          depositAmountUSD: n,
        })
        if (!n && resetOnClear) dispatch({ type: 'reset' })
      })}
      onSetMax={() => {
        dispatch({
          type: 'update-deposit',
          depositAmount: collateralBalance,
          depositAmountUSD: collateralBalance.times(collateralPrice),
        })
      }}
    />
  )
}
