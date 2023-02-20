import { useAjnaBorrowContext } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { AjnaBorrowFormContentSummary } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSummary'
import {
  AjnaBorrowFormFieldPayback,
  AjnaBorrowFormFieldWithdraw,
} from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import React from 'react'

export function AjnaBorrowFormContentPayback() {
  const {
    form: {
      state: { paybackAmount },
    },
  } = useAjnaBorrowContext()

  return (
    <>
      <AjnaBorrowFormFieldPayback resetOnClear />
      <AjnaBorrowFormFieldWithdraw isDisabled={!paybackAmount || paybackAmount?.lte(0)} />
      {paybackAmount && <AjnaBorrowFormContentSummary />}
    </>
  )
}
