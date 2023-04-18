import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaMultiplySlider } from 'features/ajna/positions/multiply/components/AjnaMultiplySlider'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'
import { ajnaMultiplySliderDefaults } from 'features/ajna/positions/multiply/temp'
import React from 'react'

export function AjnaMultiplyFormContentAdjust() {
  const {
    form: {
      state: { targetLiquidationPrice },
    },
  } = useAjnaProductContext('multiply')

  return (
    <>
      <AjnaMultiplySlider />
      {/* TODO: add condition to check if current targetLiquidationPrice is different than position targetLiquidationPrice based on simulation */}
      {targetLiquidationPrice && !ajnaMultiplySliderDefaults.initial.eq(targetLiquidationPrice) && (
        <AjnaFormContentSummary>
          <AjnaMultiplyFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
