import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldGenerate } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'
import React from 'react'

export function AjnaMultiplyFormContentGenerate() {
  const {
    form: {
      dispatch,
      state: { generateAmount },
    },
  } = useAjnaProductContext('multiply')

  return (
    <>
      <AjnaFormFieldGenerate
        dispatchAmount={dispatch}
        // maxAmount={debtMax}
        // minAmount={debtMin}
        resetOnClear
      />
      {generateAmount && (
        <AjnaFormContentSummary>
          <AjnaMultiplyFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
