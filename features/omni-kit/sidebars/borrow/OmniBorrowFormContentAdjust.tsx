import { OmniAdjustSlider } from 'features/omni-kit/common/sidebars/OmniAdjustSlider'
import { OmniBorrowFormOrder } from 'features/omni-kit/common/sidebars/OmniBorrowFormOrder'
import { OmniFormContentSummary } from 'features/omni-kit/common/sidebars/OmniFormContentSummary'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
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
