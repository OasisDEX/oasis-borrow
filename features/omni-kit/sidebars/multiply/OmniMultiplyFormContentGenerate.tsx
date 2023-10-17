import { OmniFormContentSummary } from 'features/omni-kit/common/sidebars/OmniFormContentSummary'
import { OmniFormFieldGenerate } from 'features/omni-kit/common/sidebars/OmniFormFields'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniMultiplyFormOrder } from 'features/omni-kit/sidebars/multiply/OmniMultiplyFormOrder'
import React from 'react'

export function OmniMultiplyFormContentGenerate() {
  const {
    form: {
      dispatch,
      state: { generateAmount },
    },

    dynamicMetadata,
  } = useOmniProductContext('multiply')

  const {
    values: { debtMin, debtMax },
  } = dynamicMetadata('multiply')

  return (
    <>
      <OmniFormFieldGenerate
        dispatchAmount={dispatch}
        maxAmount={debtMax}
        minAmount={debtMin}
        resetOnClear
      />
      {generateAmount && (
        <OmniFormContentSummary>
          <OmniMultiplyFormOrder />
        </OmniFormContentSummary>
      )}
    </>
  )
}
