import { AjnaAdjustSlider } from 'features/ajna/positions/common/components/AjnaAdjustSlider'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
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
  } = useGenericProductContext('borrow')

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
