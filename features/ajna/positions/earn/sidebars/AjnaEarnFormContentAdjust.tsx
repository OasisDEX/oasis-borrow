import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaEarnSlider } from 'features/ajna/positions/earn/components/AjnaEarnSlider'
import { AjnaEarnFormOrder } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormOrder'
import React from 'react'

export function AjnaEarnFormContentAdjust() {
  const {
    form: {
      state: { price },
    },
    position: {
      currentPosition: {
        position: { price: currentPrice },
      },
    },
  } = useAjnaProductContext('earn')

  return (
    <>
      <AjnaEarnSlider />
      {!price?.decimalPlaces(2).eq(currentPrice.decimalPlaces(2)) && (
        <AjnaFormContentSummary>
          <AjnaEarnFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
