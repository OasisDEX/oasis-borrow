import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { AjnaFormFieldDeposit } from 'features/ajna/common/components/AjnaFormFieldDeposit'
import { AjnaValidationMessages } from 'features/ajna/common/components/AjnaValidationMessages'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import {
  AjnaEarnSlider,
  ajnaSliderDefaults,
  ajnaSliderHighRange,
  ajnaSliderLowRange,
} from 'features/ajna/earn/components/AjnaEarnSlider'
import { AjnaEarnFormOrder } from 'features/ajna/earn/sidebars/AjnaEarnFormOrder'
import React from 'react'

export function AjnaEarnFormContentDeposit() {
  const {
    form: {
      dispatch,
      state: { depositAmount, depositAmountUSD },
    },
    validation: { errors, warnings },
  } = useAjnaProductContext('earn')

  return (
    <>
      <AjnaFormFieldDeposit
        depositAmount={depositAmount}
        depositAmountUSD={depositAmountUSD}
        resetOnClear
      />
      <AjnaEarnSlider {...ajnaSliderDefaults} />
      <AjnaEarnSlider {...ajnaSliderLowRange} />
      <AjnaEarnSlider {...ajnaSliderHighRange} />
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
