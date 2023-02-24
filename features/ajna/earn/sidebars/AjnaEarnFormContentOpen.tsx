import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { AjnaValidationMessages } from 'features/ajna/common/components/AjnaValidationMessages'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import { AjnaFormFieldDeposit } from 'features/ajna/common/sidebars/AjnaFormFields'
import { AjnaEarnSlider } from 'features/ajna/earn/components/AjnaEarnSlider'
import { AjnaEarnFormOrder } from 'features/ajna/earn/sidebars/AjnaEarnFormOrder'
import React from 'react'

export function AjnaEarnFormContentOpen() {
  const {
    form: {
      dispatch,
      state: { depositAmount },
    },
    validation: { errors, warnings },
  } = useAjnaProductContext('earn')
  const {
    environment: { quoteBalance, quotePrice, quoteToken },
  } = useAjnaGeneralContext()

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
        <>
          <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />
          <AjnaValidationMessages {...errors} />
          <AjnaValidationMessages {...warnings} />
          <AjnaEarnFormOrder />
        </>
      )}
    </>
  )
}
