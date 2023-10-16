import { AjnaBorrowFormOrder } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormOrder'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import {
  AjnaFormFieldDeposit,
  AjnaFormFieldGenerate,
} from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import React from 'react'

export function AjnaBorrowFormContentDeposit() {
  const {
    environment: { collateralBalance, collateralDigits, collateralPrice, collateralToken },
  } = useProtocolGeneralContext()
  const {
    form: {
      dispatch,
      state: { depositAmount, generateAmount },
    },

    dynamicMetadata,
  } = useGenericProductContext('borrow')

  const { highlighterOrderInformation, debtMin, debtMax } = dynamicMetadata('borrow')

  return (
    <>
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        maxAmount={collateralBalance}
        resetOnClear
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenDigits={collateralDigits}
      />
      <AjnaFormFieldGenerate dispatchAmount={dispatch} maxAmount={debtMax} minAmount={debtMin} />
      {highlighterOrderInformation}
      {(depositAmount || generateAmount) && (
        <AjnaFormContentSummary>
          <AjnaBorrowFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
