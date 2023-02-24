import { AjnaBorrowFormContentSummary } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSummary'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import {
  AjnaFormFieldPayback,
  AjnaFormFieldWithdraw,
} from 'features/ajna/common/sidebars/AjnaFormFields'
import React from 'react'

export function AjnaBorrowFormContentPayback() {
  const {
    environment: { collateralBalance, collateralPrice, collateralToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { paybackAmount },
    },
  } = useAjnaProductContext('borrow')

  return (
    <>
      <AjnaFormFieldPayback dispatchAmount={dispatch} resetOnClear />
      <AjnaFormFieldWithdraw
        dispatchAmount={dispatch}
        isDisabled={!paybackAmount || paybackAmount?.lte(0)}
        tokenBalance={collateralBalance}
        token={collateralToken}
        tokenPrice={collateralPrice}
      />
      {paybackAmount && <AjnaBorrowFormContentSummary />}
    </>
  )
}
