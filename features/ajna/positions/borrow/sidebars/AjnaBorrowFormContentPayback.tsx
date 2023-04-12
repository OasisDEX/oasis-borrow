import { getToken } from 'blockchain/tokensMetadata'
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
import React from 'react'

export function AjnaBorrowFormContentPayback() {
  const {
    environment: { collateralPrice, collateralToken, quoteBalance, quoteToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { paybackAmount },
    },
    position: {
      currentPosition: { position, simulation },
    },
  } = useAjnaProductContext('borrow')

  const collateralMax = getAjnaBorrowCollateralMax({
    digits: getToken(collateralToken).digits,
    position,
    simulation,
  })
  const paybackMax = getAjnaBorrowPaybackMax({
    balance: quoteBalance,
    digits: getToken(quoteToken).digits,
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
        isDisabled={!paybackAmount || paybackAmount?.lte(0)}
        maxAmount={collateralMax}
        token={collateralToken}
        tokenPrice={collateralPrice}
      />
      {paybackAmount && (
        <AjnaFormContentSummary>
          <AjnaBorrowFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
