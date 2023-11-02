import {
  OmniFormContentSummary,
  OmniFormFieldGenerate,
} from 'features/omni-kit/components/sidebars'
import { OmniMultiplyFormOrder } from 'features/omni-kit/components/sidebars/multiply'
import { useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function OmniMultiplyFormContentGenerate() {
  const {
    form: {
      dispatch,
      state: { generateAmount },
    },

    dynamicMetadata: {
      values: { debtMin, debtMax },
    },
  } = useOmniProductContext(OmniProductType.Multiply)

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
