import { useAjnaBorrowContext } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { AjnaBorrowFormContentSummary } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSummary'
import {
  AjnaBorrowFormFieldDeposit,
  AjnaBorrowFormFieldGenerate,
} from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import React from 'react'

export function AjnaBorrowFormContentGenerate() {
  const {
    form: {
      state: { generateAmount },
    },
  } = useAjnaBorrowContext()

  return (
    <>
      <AjnaBorrowFormFieldGenerate resetOnClear />
      <AjnaBorrowFormFieldDeposit isDisabled={!generateAmount || generateAmount?.lte(0)} />
      {generateAmount && <AjnaBorrowFormContentSummary />}
    </>
  )
}
