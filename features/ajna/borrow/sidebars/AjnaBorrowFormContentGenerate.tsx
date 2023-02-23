import { AjnaBorrowFormContentSummary } from 'features/ajna/borrow/sidebars/AjnaBorrowFormContentSummary'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import {
  AjnaFormFieldDeposit,
  AjnaFormFieldGenerate,
} from 'features/ajna/common/sidebars/AjnaFormFields'
import React from 'react'

export function AjnaBorrowFormContentGenerate() {
  const {
    form: {
      dispatch,
      state: { generateAmount },
    },
  } = useAjnaProductContext('borrow')
  const {
    environment: { collateralBalance, collateralPrice, collateralToken },
  } = useAjnaGeneralContext()

  return (
    <>
      <AjnaFormFieldGenerate dispatchAmount={dispatch} resetOnClear />
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        isDisabled={!generateAmount || generateAmount?.lte(0)}
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenBalance={collateralBalance}
      />
      {generateAmount && <AjnaBorrowFormContentSummary />}
    </>
  )
}
