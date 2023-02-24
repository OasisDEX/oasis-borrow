import { AjnaBorrowFormContentSummary } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSummary'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import {
  AjnaFormFieldDeposit,
  AjnaFormFieldGenerate,
} from 'features/ajna/common/sidebars/AjnaFormFields'
import React from 'react'

export function AjnaBorrowFormContentDeposit() {
  const {
    form: {
      dispatch,
      state: { depositAmount },
    },
  } = useAjnaProductContext('borrow')
  const {
    environment: { collateralBalance, collateralPrice, collateralToken },
  } = useAjnaGeneralContext()

  return (
    <>
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenBalance={collateralBalance}
        resetOnClear
      />
      <AjnaFormFieldGenerate
        dispatchAmount={dispatch}
        isDisabled={!depositAmount || depositAmount?.lte(0)}
      />
      {depositAmount && <AjnaBorrowFormContentSummary />}
    </>
  )
}
