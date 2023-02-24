import { AjnaBorrowFormContentSummary } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSummary'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import {
  AjnaFormFieldPayback,
  AjnaFormFieldWithdraw,
} from 'features/ajna/common/sidebars/AjnaFormFields'
import React from 'react'

export function AjnaBorrowFormContentWithdraw() {
  const {
    environment: { collateralBalance, collateralPrice, collateralToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { withdrawAmount },
    },
  } = useAjnaProductContext('borrow')

  return (
    <>
      <AjnaFormFieldWithdraw
        dispatchAmount={dispatch}
        tokenBalance={collateralBalance}
        token={collateralToken}
        tokenPrice={collateralPrice}
        resetOnClear
      />
      <AjnaFormFieldPayback
        dispatchAmount={dispatch}
        isDisabled={!withdrawAmount || withdrawAmount?.lte(0)}
      />
      {withdrawAmount && <AjnaBorrowFormContentSummary />}
    </>
  )
}
