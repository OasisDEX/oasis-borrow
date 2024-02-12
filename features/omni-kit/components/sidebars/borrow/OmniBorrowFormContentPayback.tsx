import {
  OmniFormContentSummary,
  OmniFormFieldPayback,
  OmniFormFieldWithdraw,
} from 'features/omni-kit/components/sidebars'
import { OmniBorrowFormOrder } from 'features/omni-kit/components/sidebars/borrow'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function OmniBorrowFormContentPayback() {
  const {
    environment: {
      collateralDigits,
      collateralPrice,
      collateralToken,
      quoteBalance,
      collateralPrecision,
    },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { paybackAmount, withdrawAmount },
    },
    position: {
      currentPosition: { position },
    },
    dynamicMetadata: {
      values: { withdrawMax, paybackMax },
    },
  } = useOmniProductContext(OmniProductType.Borrow)

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
        maxAmount={withdrawMax}
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenDigits={collateralDigits}
        tokenPrecision={collateralPrecision}
      />
      {(paybackAmount || withdrawAmount) && (
        <OmniFormContentSummary>
          <OmniBorrowFormOrder />
        </OmniFormContentSummary>
      )}
    </>
  )
}
