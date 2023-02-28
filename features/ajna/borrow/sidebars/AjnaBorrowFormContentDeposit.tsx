import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/common/sidebars/AjnaFormContentSummary'
import {
  AjnaFormFieldDeposit,
  AjnaFormFieldGenerate,
} from 'features/ajna/common/sidebars/AjnaFormFields'
import React from 'react'

export function AjnaBorrowFormContentDeposit() {
  const {
    environment: { collateralBalance, collateralPrice, collateralToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { depositAmount },
    },
  } = useAjnaProductContext('borrow')

  return (
    <>
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenBalance={collateralBalance}
        resetOnClear
      />
      <AjnaFormFieldGenerate
        dispatchAmount={dispatch}
        isDisabled={!depositAmount || depositAmount?.lte(0)}
      />
      {depositAmount && (
        <AjnaFormContentSummary>
          <AjnaBorrowFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
