import { useAjnaBorrowContext } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { AjnaBorrowFormContentSummary } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSummary'
import { AjnaBorrowFormFieldGenerate } from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import { AjnaFormFieldDeposit } from 'features/ajna/common/components/AjnaFormFieldDeposit'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormContentDeposit() {
  const {
    form: {
      state: { depositAmount, depositAmountUSD },
      dispatch,
    },
  } = useAjnaBorrowContext()
  const {
    environment: { collateralBalance, collateralPrice, collateralToken },
  } = useAjnaProductContext()

  return (
    <>
      <AjnaFormFieldDeposit
        dispatch={dispatch}
        collateralToken={collateralToken}
        collateralBalance={collateralBalance}
        collateralPrice={collateralPrice}
        depositAmount={depositAmount}
        depositAmountUSD={depositAmountUSD}
        resetOnClear
      />
      <AjnaBorrowFormFieldGenerate isDisabled={!depositAmount || depositAmount?.lte(0)} />
      {depositAmount && <AjnaBorrowFormContentSummary />}
    </>
  )
}
