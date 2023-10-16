import { getAjnaBorrowCollateralMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowCollateralMax'
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

export function AjnaBorrowFormContentWithdraw() {
  const {
    environment: { collateralDigits, quoteDigits, collateralPrice, collateralToken, quoteBalance },
  } = useProtocolGeneralContext()
  const {
    form: {
      dispatch,
      state: { withdrawAmount, paybackAmount },
    },
    position: {
      currentPosition: { position, simulation },
    },
  } = useGenericProductContext('borrow')

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
      <AjnaFormFieldWithdraw
        dispatchAmount={dispatch}
        maxAmount={collateralMax}
        resetOnClear
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenDigits={collateralDigits}
      />
      <AjnaFormFieldPayback
        dispatchAmount={dispatch}
        maxAmount={paybackMax}
        maxAmountLabel={quoteBalance.lt(debtAmount) ? 'balance' : 'max'}
      />
      {(withdrawAmount || paybackAmount) && (
        <AjnaFormContentSummary>
          <AjnaBorrowFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
