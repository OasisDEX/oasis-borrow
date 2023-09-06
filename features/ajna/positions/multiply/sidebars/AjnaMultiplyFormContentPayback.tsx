import React from 'react'
import { getToken } from 'blockchain/tokensMetadata'
import { getAjnaBorrowPaybackMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowPaybackMax'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldPayback } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'

export function AjnaMultiplyFormContentPayback() {
  const {
    environment: { quoteBalance, quoteToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { paybackAmount },
    },
    position: {
      currentPosition: { position },
    },
  } = useAjnaProductContext('multiply')

  const paybackMax = getAjnaBorrowPaybackMax({
    balance: quoteBalance,
    digits: getToken(quoteToken).digits,
    position,
  })

  return (
    <>
      <AjnaFormFieldPayback
        dispatchAmount={dispatch}
        maxAmount={paybackMax}
        maxAmountLabel={quoteBalance.lt(position.debtAmount) ? 'balance' : 'max'}
        resetOnClear
      />
      {paybackAmount && (
        <AjnaFormContentSummary>
          <AjnaMultiplyFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
