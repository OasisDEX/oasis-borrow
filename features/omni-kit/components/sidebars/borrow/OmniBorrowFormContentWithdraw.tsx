import {
  OmniFormContentSummary,
  OmniFormFieldPayback,
  OmniFormFieldWithdraw,
} from 'features/omni-kit/components/sidebars'
import { OmniBorrowFormOrder } from 'features/omni-kit/components/sidebars/borrow'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function OmniBorrowFormContentWithdraw() {
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
      state: { withdrawAmount, paybackAmount },
    },
    position: {
      currentPosition: { position },
    },
    dynamicMetadata: {
      values: { collateralMax, paybackMax },
    },
  } = useOmniProductContext(OmniProductType.Borrow)

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
        tokenPrecision={collateralPrecision}
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
