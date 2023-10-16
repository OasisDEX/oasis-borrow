import { getToken } from 'blockchain/tokensMetadata'
import { getAjnaBorrowPaybackMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowPaybackMax'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldPayback } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'
import React from 'react'

export function AjnaMultiplyFormContentPayback() {
  const {
    environment: { quoteBalance, quoteToken },
  } = useProtocolGeneralContext()
  const {
    form: {
      dispatch,
      state: { paybackAmount },
    },
    position: {
      currentPosition: { position },
    },
  } = useGenericProductContext('multiply')

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
