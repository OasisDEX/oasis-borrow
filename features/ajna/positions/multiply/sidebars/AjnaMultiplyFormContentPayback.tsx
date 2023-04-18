import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldPayback } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'
import React from 'react'

export function AjnaMultiplyFormContentPayback() {
  const {
    form: {
      dispatch,
      state: { paybackAmount },
    },
  } = useAjnaProductContext('multiply')

  return (
    <>
      <AjnaFormFieldPayback
        dispatchAmount={dispatch}
        // maxAmount={paybackMax}
        // maxAmountLabel={quoteBalance.lt(debtAmount) ? 'balance' : 'max'}
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
