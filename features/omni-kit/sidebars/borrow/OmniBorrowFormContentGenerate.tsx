import { OmniFormContentSummary } from 'features/omni-kit/common/sidebars/OmniFormContentSummary'
import {
  OmniFormFieldDeposit,
  OmniFormFieldGenerate,
} from 'features/omni-kit/common/sidebars/OmniFormFields'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniBorrowFormOrder } from 'features/omni-kit/sidebars/borrow/OmniBorrowFormOrder'
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

  const { debtMin, debtMax, highlighterOrderInformation } = dynamicMetadata('borrow')

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
