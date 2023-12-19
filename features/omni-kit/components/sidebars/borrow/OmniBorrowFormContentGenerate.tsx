import {
  OmniFormContentSummary,
  OmniFormFieldDeposit,
  OmniFormFieldGenerate,
} from 'features/omni-kit/components/sidebars'
import { OmniBorrowFormOrder } from 'features/omni-kit/components/sidebars/borrow/OmniBorrowFormOrder'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function OmniBorrowFormContentGenerate() {
  const {
    environment: {
      collateralBalance,
      collateralDigits,
      collateralPrecision,
      collateralPrice,
      collateralToken,
      shouldSwitchNetwork,
    },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { generateAmount, depositAmount },
    },
    dynamicMetadata: {
      values: { debtMax, debtMin },
      elements: { highlighterOrderInformation },
    },
  } = useOmniProductContext(OmniProductType.Borrow)

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
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenDigits={collateralDigits}
        tokenPrecision={collateralPrecision}
        {...(!shouldSwitchNetwork && { maxAmount: collateralBalance })}
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
