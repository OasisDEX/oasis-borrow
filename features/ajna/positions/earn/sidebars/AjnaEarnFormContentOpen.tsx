import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldDeposit } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaEarnSlider } from 'features/ajna/positions/earn/components/AjnaEarnSlider'
import { AjnaEarnFormOrder } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormOrder'
import React from 'react'

export function AjnaEarnFormContentOpen() {
  const {
    environment: { quoteBalance, quotePrice, quoteToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { depositAmount },
    },
  } = useAjnaProductContext('earn')

  return (
    <>
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        token={quoteToken}
        tokenPrice={quotePrice}
        tokenBalance={quoteBalance}
        resetOnClear
      />
      <AjnaEarnSlider />
      {depositAmount && (
        <AjnaFormContentSummary>
          <AjnaEarnFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
