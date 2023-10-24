import {
  OmniFormContentSummary,
  OmniFormFieldGenerate,
} from 'features/omni-kit/components/sidebars'
import { OmniMultiplyFormOrder } from 'features/omni-kit/components/sidebars/multiply'
import { useOmniProductContext } from 'features/omni-kit/contexts'
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
  } = dynamicMetadata

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
