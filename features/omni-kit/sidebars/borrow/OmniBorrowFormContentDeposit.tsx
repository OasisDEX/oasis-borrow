import { OmniBorrowFormOrder } from 'features/omni-kit/common/sidebars/OmniBorrowFormOrder'
import { OmniFormContentSummary } from 'features/omni-kit/common/sidebars/OmniFormContentSummary'
import {
  OmniFormFieldDeposit,
  OmniFormFieldGenerate,
} from 'features/omni-kit/common/sidebars/OmniFormFields'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
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

  const { debtMax, debtMin, highlighterOrderInformation } = dynamicMetadata('borrow')

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
