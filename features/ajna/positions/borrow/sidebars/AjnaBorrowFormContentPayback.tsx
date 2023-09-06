import React from 'react'
import { getAjnaBorrowCollateralMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowCollateralMax'
import { getAjnaBorrowPaybackMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowPaybackMax'
import { AjnaBorrowFormOrder } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import {
  AjnaFormFieldPayback,
  AjnaFormFieldWithdraw,
} from 'features/ajna/positions/common/sidebars/AjnaFormFields'

export function AjnaBorrowFormContentPayback() {
  const {
    environment: { collateralDigits, collateralPrice, quoteDigits, collateralToken, quoteBalance },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { paybackAmount, withdrawAmount },
    },
    position: {
      currentPosition: { position, simulation },
    },
  } = useAjnaProductContext('borrow')

  const collateralMax = getAjnaBorrowCollateralMax({
    digits: collateralDigits,
    position,
    simulation,
  })
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
