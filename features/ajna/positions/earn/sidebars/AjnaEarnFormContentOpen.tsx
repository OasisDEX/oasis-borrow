import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldDeposit } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaEarnSlider } from 'features/ajna/positions/earn/components/AjnaEarnSlider'
import { AjnaEarnFormOrder } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormOrder'
import React from 'react'

export function AjnaEarnFormContentOpen() {
  const {
    environment: { quotePrice, quoteToken },
  } = useAjnaGeneralContext()
  const {
    form: { dispatch },
    validation: { isFormValid },
  } = useAjnaProductContext('earn')

  return (
    <>
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        token={quoteToken}
        tokenPrice={quotePrice}
        resetOnClear
      />
      <AjnaEarnSlider />
      {isFormValid && (
        <AjnaFormContentSummary>
          <AjnaEarnFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
