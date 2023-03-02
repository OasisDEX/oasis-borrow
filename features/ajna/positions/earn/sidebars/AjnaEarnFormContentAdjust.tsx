import { AjnaEarnSlider } from 'features/ajna/positions/earn/components/AjnaEarnSlider'
import React from 'react'

export function AjnaEarnFormContentAdjust() {
  return (
    <>
      <AjnaEarnSlider />
      {/* TODO: show reset and order information if current value is different than default */}
      {/* {prize && <AjnaEarnFormContentSummary />} */}
    </>
  )
}
