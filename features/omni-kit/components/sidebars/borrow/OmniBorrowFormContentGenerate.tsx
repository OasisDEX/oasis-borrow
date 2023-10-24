import {
  OmniFormContentSummary,
  OmniFormFieldDeposit,
  OmniFormFieldGenerate,
} from 'features/omni-kit/components/sidebars'
import { OmniBorrowFormOrder } from 'features/omni-kit/components/sidebars/borrow/OmniBorrowFormOrder'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import React from 'react'

export function OmniBorrowFormContentGenerate() {
  const {
    environment: { collateralBalance, collateralDigits, collateralPrice, collateralToken },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { generateAmount, depositAmount },
    },
    dynamicMetadata,
  } = useOmniProductContext('borrow')

  const {
    values: { debtMax, debtMin },
    elements: { highlighterOrderInformation },
  } = dynamicMetadata

  return (
    <>
      <OmniFormFieldGenerate
        dispatchAmount={dispatch}
        maxAmount={debtMax}
        minAmount={debtMin}
        resetOnClear
      />
      <OmniFormFieldDeposit
        dispatchAmount={dispatch}
        maxAmount={collateralBalance}
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenDigits={collateralDigits}
      />
      {highlighterOrderInformation}
      {(generateAmount || depositAmount) && (
        <>
          <OmniFormContentSummary>
            <OmniBorrowFormOrder />
          </OmniFormContentSummary>
        </>
      )}
    </>
  )
}
