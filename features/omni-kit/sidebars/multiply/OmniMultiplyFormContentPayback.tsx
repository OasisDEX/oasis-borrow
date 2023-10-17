import { OmniFormContentSummary } from 'features/omni-kit/common/sidebars/OmniFormContentSummary'
import { OmniFormFieldPayback } from 'features/omni-kit/common/sidebars/OmniFormFields'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniMultiplyFormOrder } from 'features/omni-kit/sidebars/multiply/OmniMultiplyFormOrder'
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
    dynamicMetadata,
  } = useOmniProductContext('multiply')

  const {
    values: { paybackMax },
  } = dynamicMetadata('multiply')

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
