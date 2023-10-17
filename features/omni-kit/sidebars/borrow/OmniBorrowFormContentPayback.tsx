import { OmniBorrowFormOrder } from 'features/omni-kit/common/sidebars/OmniBorrowFormOrder'
import { OmniFormContentSummary } from 'features/omni-kit/common/sidebars/OmniFormContentSummary'
import {
  OmniFormFieldPayback,
  OmniFormFieldWithdraw,
} from 'features/omni-kit/common/sidebars/OmniFormFields'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
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

  const { collateralMax, paybackMax } = dynamicMetadata('borrow')

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
