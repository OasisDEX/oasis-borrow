import { AjnaBorrowFormOrder } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormOrder'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import {
  AjnaFormFieldDeposit,
  AjnaFormFieldGenerate,
} from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import React from 'react'

export function AjnaBorrowFormContentGenerate() {
  const {
    environment: { collateralBalance, collateralDigits, collateralPrice, collateralToken },
  } = useProtocolGeneralContext()
  const {
    form: {
      dispatch,
      state: { generateAmount, depositAmount },
    },
    dynamicMetadata,
  } = useGenericProductContext('borrow')

  const { highlighterOrderInformation, debtMax, debtMin } = dynamicMetadata('borrow')

  return (
    <>
      <AjnaFormFieldGenerate
        dispatchAmount={dispatch}
        maxAmount={debtMax}
        minAmount={debtMin}
        resetOnClear
      />
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        maxAmount={collateralBalance}
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenDigits={collateralDigits}
      />
      {highlighterOrderInformation}
      {(generateAmount || depositAmount) && (
        <>
          <AjnaFormContentSummary>
            <AjnaBorrowFormOrder />
          </AjnaFormContentSummary>
        </>
      )}
    </>
  )
}
