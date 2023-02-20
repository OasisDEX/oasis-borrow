import { AjnaBorrowFormContentSummary } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSummary'
import { AjnaBorrowFormFieldGenerate } from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import { AjnaFormFieldDeposit } from 'features/ajna/common/components/AjnaFormFieldDeposit'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormContentGenerate() {
  const {
    form: {
      state: { depositAmount, depositAmountUSD, generateAmount },
    },
  } = useAjnaProductContext('borrow')

  return (
    <>
      <AjnaBorrowFormFieldGenerate resetOnClear />
      <AjnaFormFieldDeposit
        isDisabled={!generateAmount || generateAmount?.lte(0)}
        depositAmount={depositAmount}
        depositAmountUSD={depositAmountUSD}
      />
      {generateAmount && <AjnaBorrowFormContentSummary />}
    </>
  )
}
