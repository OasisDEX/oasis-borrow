import { AjnaBorrowFormContentSummary } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSummary'
import {
  AjnaBorrowFormFieldPayback,
  AjnaBorrowFormFieldWithdraw,
} from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormContentPayback() {
  const {
    form: {
      state: { paybackAmount },
    },
  } = useAjnaProductContext('borrow')

  return (
    <>
      <AjnaBorrowFormFieldPayback resetOnClear />
      <AjnaBorrowFormFieldWithdraw isDisabled={!paybackAmount || paybackAmount?.lte(0)} />
      {paybackAmount && <AjnaBorrowFormContentSummary />}
    </>
  )
}
