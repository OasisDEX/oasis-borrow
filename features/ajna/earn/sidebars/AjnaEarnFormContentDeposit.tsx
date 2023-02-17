import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import { AjnaFormFieldDeposit } from 'features/ajna/common/components/AjnaFormFieldDeposit'
import { AjnaValidationMessages } from 'features/ajna/components/AjnaValidationMessages'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import {
  AjnaEarnSlider,
  ajnaSliderDefaults,
  ajnaSliderHighRange,
  ajnaSliderLowRange,
} from 'features/ajna/earn/components/AjnaEarnSlider'
import { useAjnaEarnContext } from 'features/ajna/earn/contexts/AjnaEarnContext'
import React from 'react'

export function AjnaEarnFormContentDeposit() {
  const {
    environment: { collateralBalance, collateralToken, collateralPrice },
  } = useAjnaProductContext()
  const {
    form: {
      dispatch,
      state: { depositAmount, depositAmountUSD },
    },
    validation: { errors, warnings },
  } = useAjnaEarnContext()

  return (
    <>
      <AjnaFormFieldDeposit
        resetOnClear
        collateralToken={collateralToken}
        collateralBalance={collateralBalance}
        collateralPrice={collateralPrice}
        depositAmount={depositAmount}
        depositAmountUSD={depositAmountUSD}
        dispatch={dispatch}
      />
      <AjnaEarnSlider {...ajnaSliderDefaults} />
      <AjnaEarnSlider {...ajnaSliderLowRange} />
      <AjnaEarnSlider {...ajnaSliderHighRange} />
      {depositAmount && (
        <>
          <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />
          <AjnaValidationMessages {...errors} />
          <AjnaValidationMessages {...warnings} />
          <AjnaBorrowFormOrder />
        </>
      )}
    </>
  )
}
