import { OmniAdjustSlider, OmniFormContentSummary } from 'features/omni-kit/components/sidebars'
import { OmniBorrowFormOrder } from 'features/omni-kit/components/sidebars/borrow'
import { useOmniProductContext } from 'features/omni-kit/contexts'
import React from 'react'

export function OmniBorrowFormContentAdjust() {
  const {
    form: {
      state: { loanToValue },
    },
    position: {
      currentPosition: { position },
    },
  } = useOmniProductContext('borrow')

  return (
    <>
      <OmniAdjustSlider />
      {loanToValue && !position.riskRatio.loanToValue.eq(loanToValue) && (
        <OmniFormContentSummary>
          <OmniBorrowFormOrder />
        </OmniFormContentSummary>
      )}
    </>
  )
}
