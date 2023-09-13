import { AjnaAdjustSlider } from 'features/ajna/positions/common/components/AjnaAdjustSlider'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import React from 'react'

import { AjnaBorrowFormOrder } from './AjnaBorrowFormOrder'

export function AjnaBorrowFormContentAdjust() {
  const {
    form: {
      state: { loanToValue },
    },
    position: {
      currentPosition: { position },
    },
  } = useAjnaProductContext('borrow')

  return (
    <>
      <AjnaAdjustSlider />
      {loanToValue && !position.riskRatio.loanToValue.eq(loanToValue) && (
        <AjnaFormContentSummary>
          <AjnaBorrowFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
