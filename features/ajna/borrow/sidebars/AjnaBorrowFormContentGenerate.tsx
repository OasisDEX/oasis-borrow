import { AjnaBorrowFormContentSummary } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSummary'
import { AjnaBorrowFormFieldGenerate } from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import { AjnaFormFieldDeposit } from 'features/ajna/common/components/AjnaFormFieldDeposit'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormContentGenerate() {
  const {
    environment: { collateralBalance, collateralPrice, collateralToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      state: { depositAmount, depositAmountUSD, generateAmount },
      dispatch,
    },
  } = useAjnaProductContext('borrow')

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
