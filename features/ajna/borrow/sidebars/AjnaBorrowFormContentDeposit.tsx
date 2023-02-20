import { AjnaBorrowFormContentSummary } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSummary'
import { AjnaBorrowFormFieldGenerate } from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import { AjnaFormFieldDeposit } from 'features/ajna/common/components/AjnaFormFieldDeposit'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormContentDeposit() {
  const {
    form: {
      state: { depositAmount, depositAmountUSD },
    },
  } = useAjnaProductContext('borrow')

  return (
    <>
      <AjnaFormFieldDeposit
        depositAmount={depositAmount}
        depositAmountUSD={depositAmountUSD}
        resetOnClear
      />
      <AjnaBorrowFormFieldGenerate isDisabled={!depositAmount || depositAmount?.lte(0)} />
      {depositAmount && <AjnaBorrowFormContentSummary />}
    </>
  )
}
