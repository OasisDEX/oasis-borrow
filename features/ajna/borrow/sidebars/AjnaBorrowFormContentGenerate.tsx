import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { AjnaBorrowFormFieldGenerate } from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import { AjnaFormFieldDeposit } from 'features/ajna/common/components/AjnaFormFieldDeposit'
import { AjnaValidationMessages } from 'features/ajna/components/AjnaValidationMessages'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormContentGenerate() {
  const {
    form: {
      dispatch,
      state: { depositAmount, depositAmountUSD, generateAmount },
    },
    environment: { collateralBalance, collateralPrice, collateralToken },
    validation: { errors, warnings },
  } = useAjnaBorrowContext()

  return (
    <>
      <AjnaBorrowFormFieldGenerate resetOnClear />
      <AjnaFormFieldDeposit
        isDisabled={!generateAmount || generateAmount?.lte(0)}
        collateralToken={collateralToken}
        collateralBalance={collateralBalance}
        collateralPrice={collateralPrice}
        depositAmount={depositAmount}
        depositAmountUSD={depositAmountUSD}
        dispatch={dispatch}
      />
      {generateAmount && (
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
