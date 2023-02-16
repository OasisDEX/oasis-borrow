import { useAjnaBorrowContext } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { AjnaBorrowFormContentSummary } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSummary'
import {
  AjnaBorrowFormFieldGenerate,
} from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import { AjnaFormFieldDeposit } from 'features/ajna/common/components/AjnaFormFieldDeposit'
import React from 'react'

export function AjnaBorrowFormContentGenerate() {
  const {
    form: {
      state: { depositAmount, depositAmountUSD, generateAmount },
      dispatch,
    },
    environment: { collateralBalance, collateralPrice, collateralToken },
  } = useAjnaBorrowContext()

  return (
    <>
      <AjnaBorrowFormFieldGenerate resetOnClear />
      <AjnaFormFieldDeposit
        isDisabled={!generateAmount || generateAmount?.lte(0)}
        collateralToken={collateralToken}
        collateralBalance={collateralBalance}
        collateralPrice={collateralPrice}
        depositAmount={depositAmount}
        depositAmountUSD={depositAmountUSD}
        dispatch={dispatch}
      />
      {generateAmount && <AjnaBorrowFormContentSummary />}
    </>
  )
}
