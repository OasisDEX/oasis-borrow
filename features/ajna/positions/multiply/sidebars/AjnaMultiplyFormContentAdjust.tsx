import React from 'react'
import { AjnaAdjustSlider } from 'features/ajna/positions/common/components/AjnaAdjustSlider'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'

export function AjnaMultiplyFormContentAdjust() {
  const {
    form: {
      state: { loanToValue },
    },
    position: {
      currentPosition: { position },
    },
  } = useAjnaProductContext('multiply')

  return (
    <>
      <AjnaAdjustSlider />
      {loanToValue && !position.riskRatio.loanToValue.eq(loanToValue) && (
        <AjnaFormContentSummary>
          <AjnaMultiplyFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
