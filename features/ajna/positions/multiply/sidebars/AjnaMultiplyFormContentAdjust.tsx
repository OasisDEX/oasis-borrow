import { AjnaAdjustSlider } from 'features/ajna/positions/common/components/AjnaAdjustSlider'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'
import React from 'react'

export function AjnaMultiplyFormContentAdjust() {
  const {
    form: {
      state: { loanToValue },
    },
    position: {
      currentPosition: { position },
    },
  } = useGenericProductContext('multiply')

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
