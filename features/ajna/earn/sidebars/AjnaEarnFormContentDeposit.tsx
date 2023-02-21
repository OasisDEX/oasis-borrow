import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { AjnaFormFieldDeposit } from 'features/ajna/common/components/AjnaFormFieldDeposit'
import { AjnaValidationMessages } from 'features/ajna/components/AjnaValidationMessages'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { AjnaEarnSlider } from 'features/ajna/earn/components/AjnaEarnSlider'
import { useAjnaEarnContext } from 'features/ajna/earn/contexts/AjnaEarnContext'
import { AjnaEarnFormOrder } from 'features/ajna/earn/sidebars/AjnaEarnFormOrder'
import React from 'react'

export function AjnaEarnFormContentDeposit() {
  const {
    form: {
      dispatch,
      state: { depositAmount, depositAmountUSD },
    },
    validation: { errors, warnings },
  } = useAjnaEarnContext()
  const {
    environment: { collateralBalance, collateralToken, collateralPrice },
  } = useAjnaProductContext()

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
