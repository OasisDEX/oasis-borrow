import { OmniFormContentSummary, OmniFormFieldPayback } from 'features/omni-kit/components/sidebars'
import { OmniMultiplyFormOrder } from 'features/omni-kit/components/sidebars/multiply'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function OmniMultiplyFormContentPayback() {
  const {
    environment: { quoteBalance },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { paybackAmount },
    },
    position: {
      currentPosition: { position },
    },
    dynamicMetadata: {
      values: { paybackMax },
    },
  } = useOmniProductContext(OmniProductType.Multiply)

  return (
    <>
      <OmniFormFieldPayback
        dispatchAmount={dispatch}
        maxAmount={paybackMax}
        maxAmountLabel={quoteBalance.lt(position.debtAmount) ? 'balance' : 'max'}
        resetOnClear
      />
      {paybackAmount && (
        <OmniFormContentSummary>
          <OmniMultiplyFormOrder />
        </OmniFormContentSummary>
      )}
    </>
  )
}
