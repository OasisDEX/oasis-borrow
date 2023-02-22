import { AjnaBorrowFormContentSummary } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSummary'
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

  return (
    <>
      <AjnaFormFieldDeposit dispatchAmount={dispatch} resetOnClear />
      <AjnaFormFieldGenerate
        dispatchAmount={dispatch}
        isDisabled={!depositAmount || depositAmount?.lte(0)}
      />
      {depositAmount && <AjnaBorrowFormContentSummary />}
    </>
  )
}
