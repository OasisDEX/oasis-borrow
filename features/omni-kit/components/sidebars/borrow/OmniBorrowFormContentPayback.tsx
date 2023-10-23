import {
  OmniFormContentSummary,
  OmniFormFieldPayback,
  OmniFormFieldWithdraw,
} from 'features/omni-kit/components/sidebars'
import { OmniBorrowFormOrder } from 'features/omni-kit/components/sidebars/borrow'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import React from 'react'

export function OmniBorrowFormContentPayback() {
  const {
    environment: { collateralDigits, collateralPrice, collateralToken, quoteBalance },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { paybackAmount, withdrawAmount },
    },
    position: {
      currentPosition: { position },
    },
    dynamicMetadata,
  } = useOmniProductContext('borrow')

  const {
    values: { collateralMax, paybackMax },
  } = dynamicMetadata('borrow')

  const { debtAmount } = position

  return (
    <>
      <OmniFormFieldPayback
        dispatchAmount={dispatch}
        maxAmount={paybackMax}
        maxAmountLabel={quoteBalance.lt(debtAmount) ? 'balance' : 'max'}
        resetOnClear
      />
      <OmniFormFieldWithdraw
        dispatchAmount={dispatch}
        maxAmount={collateralMax}
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenDigits={collateralDigits}
      />
      {(paybackAmount || withdrawAmount) && (
        <OmniFormContentSummary>
          <OmniBorrowFormOrder />
        </OmniFormContentSummary>
      )}
    </>
  )
}
