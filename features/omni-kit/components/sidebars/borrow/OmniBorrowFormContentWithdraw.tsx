import {
  OmniFormContentSummary,
  OmniFormFieldPayback,
  OmniFormFieldWithdraw,
} from 'features/omni-kit/components/sidebars'
import { OmniBorrowFormOrder } from 'features/omni-kit/components/sidebars/borrow'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import React from 'react'

export function OmniBorrowFormContentWithdraw() {
  const {
    environment: { collateralDigits, collateralPrice, collateralToken, quoteBalance },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { withdrawAmount, paybackAmount },
    },
    position: {
      currentPosition: { position },
    },
    dynamicMetadata,
  } = useOmniProductContext('borrow')

  const {
    values: { collateralMax, paybackMax },
  } = dynamicMetadata

  const { debtAmount } = position

  return (
    <>
      <OmniFormFieldWithdraw
        dispatchAmount={dispatch}
        maxAmount={collateralMax}
        resetOnClear
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenDigits={collateralDigits}
      />
      <OmniFormFieldPayback
        dispatchAmount={dispatch}
        maxAmount={paybackMax}
        maxAmountLabel={quoteBalance.lt(debtAmount) ? 'balance' : 'max'}
      />
      {(withdrawAmount || paybackAmount) && (
        <OmniFormContentSummary>
          <OmniBorrowFormOrder />
        </OmniFormContentSummary>
      )}
    </>
  )
}
