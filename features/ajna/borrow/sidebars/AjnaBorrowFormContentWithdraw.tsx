
import { AjnaBorrowFormContentSummary } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSummary'
import {
  AjnaBorrowFormFieldPayback,
  AjnaBorrowFormFieldWithdraw,
} from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormContentWithdraw() {
  const {
    form: {
      state: { withdrawAmount },
    },
  } = useAjnaProductContext('borrow')

  return (
    <>
      <AjnaBorrowFormFieldWithdraw resetOnClear />
      <AjnaBorrowFormFieldPayback isDisabled={!withdrawAmount || withdrawAmount?.lte(0)} />
      {withdrawAmount && <AjnaBorrowFormContentSummary />}
    </>
  )
}
