import { getAjnaBorrowPaybackMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowPaybackMax'
import { AjnaBorrowFormOrder } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormOrder'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import {
  AjnaFormFieldPayback,
  AjnaFormFieldWithdraw,
} from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import React from 'react'

export function AjnaBorrowFormContentPayback() {
  const {
    environment: { collateralDigits, collateralPrice, quoteDigits, collateralToken, quoteBalance },
  } = useProtocolGeneralContext()
  const {
    form: {
      dispatch,
      state: { paybackAmount, withdrawAmount },
    },
    position: {
      currentPosition: { position },
    },
    dynamicMetadata,
  } = useGenericProductContext('borrow')

  const { collateralMax } = dynamicMetadata('borrow')

  const paybackMax = getAjnaBorrowPaybackMax({
    balance: quoteBalance,
    digits: quoteDigits,
    position,
  })
  const { debtAmount } = position

  return (
    <>
      <AjnaFormFieldPayback
        dispatchAmount={dispatch}
        maxAmount={paybackMax}
        maxAmountLabel={quoteBalance.lt(debtAmount) ? 'balance' : 'max'}
        resetOnClear
      />
      <AjnaFormFieldWithdraw
        dispatchAmount={dispatch}
        maxAmount={collateralMax}
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenDigits={collateralDigits}
      />
      {(paybackAmount || withdrawAmount) && (
        <AjnaFormContentSummary>
          <AjnaBorrowFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
