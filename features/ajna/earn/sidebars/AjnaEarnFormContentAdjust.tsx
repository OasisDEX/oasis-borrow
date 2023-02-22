import { AjnaEarnSlider, ajnaSliderDefaults } from 'features/ajna/earn/components/AjnaEarnSlider'
import React from 'react'

export function AjnaEarnFormContentAdjust() {
  return (
    <>
      <AjnaEarnSlider {...ajnaSliderDefaults} />
      {/* TODO: show reset and order information if current value is different than default */}
      {/* {prize && <AjnaEarnFormContentSummary />} */}
    </>
  )
}
