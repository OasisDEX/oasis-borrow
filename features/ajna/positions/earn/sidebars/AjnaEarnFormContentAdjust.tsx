import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaEarnSlider } from 'features/ajna/positions/earn/components/AjnaEarnSlider'
import { AjnaEarnFormOrder } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormOrder'
import React from 'react'

export function AjnaEarnFormContentAdjust() {
  const {
    environment: { isOracless },
  } = useProtocolGeneralContext()
  const {
    validation: { isFormValid },
    position: {
      currentPosition: {
        position: { pool },
      },
    },
  } = useAjnaProductContext('earn')

  return (
    <>
      <AjnaEarnSlider nestedManualInput={!(isOracless && pool.lowestUtilizedPriceIndex.isZero())} />
      {isFormValid && (
        <AjnaFormContentSummary>
          <AjnaEarnFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
