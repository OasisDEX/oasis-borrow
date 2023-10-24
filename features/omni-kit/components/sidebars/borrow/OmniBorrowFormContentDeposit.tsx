import {
  OmniFormContentSummary,
  OmniFormFieldDeposit,
  OmniFormFieldGenerate,
} from 'features/omni-kit/components/sidebars'
import { OmniBorrowFormOrder } from 'features/omni-kit/components/sidebars/borrow'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import React from 'react'

export function OmniBorrowFormContentDeposit() {
  const {
    environment: { collateralBalance, collateralDigits, collateralPrice, collateralToken },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { depositAmount, generateAmount },
    },

    dynamicMetadata,
  } = useOmniProductContext('borrow')

  const {
    values: { debtMax, debtMin },
    elements: { highlighterOrderInformation },
  } = dynamicMetadata

  return (
    <>
      <OmniFormFieldDeposit
        dispatchAmount={dispatch}
        maxAmount={collateralBalance}
        resetOnClear
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenDigits={collateralDigits}
      />
      <OmniFormFieldGenerate dispatchAmount={dispatch} maxAmount={debtMax} minAmount={debtMin} />
      {highlighterOrderInformation}
      {(depositAmount || generateAmount) && (
        <OmniFormContentSummary>
          <OmniBorrowFormOrder />
        </OmniFormContentSummary>
      )}
    </>
  )
}
