import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import { AjnaFormFieldDeposit } from 'features/ajna/common/components/AjnaFormFieldDeposit'
import { AjnaValidationMessages } from 'features/ajna/components/AjnaValidationMessages'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import {
  AjnaEarnSlider,
  ajnaSliderDefaults,
  ajnaSliderHighRange,
  ajnaSliderLowRange,
} from 'features/ajna/earn/components/AjnaEarnSlider'
import React from 'react'

export function AjnaEarnFormContentDeposit() {
  const {
    form: {
      dispatch,
      state: { depositAmount, depositAmountUSD },
    },
    environment: { collateralBalance, collateralPrice, collateralToken },
    validation: { errors, warnings },
  } = useAjnaBorrowContext() // TODO use earn context when available

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
