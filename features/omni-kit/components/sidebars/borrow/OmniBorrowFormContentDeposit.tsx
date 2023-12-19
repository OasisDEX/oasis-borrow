import {
  OmniFormContentSummary,
  OmniFormFieldDeposit,
  OmniFormFieldGenerate,
} from 'features/omni-kit/components/sidebars'
import { OmniBorrowFormOrder } from 'features/omni-kit/components/sidebars/borrow'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function OmniBorrowFormContentDeposit() {
  const {
    environment: {
      collateralBalance,
      collateralDigits,
      collateralPrice,
      collateralToken,
      collateralPrecision,
      shouldSwitchNetwork,
    },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { depositAmount, generateAmount },
    },

    dynamicMetadata: {
      values: { debtMax, debtMin },
      elements: { highlighterOrderInformation },
    },
  } = useOmniProductContext(OmniProductType.Borrow)

  return (
    <>
      <OmniFormFieldDeposit
        dispatchAmount={dispatch}
        resetOnClear
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenDigits={collateralDigits}
        tokenPrecision={collateralPrecision}
        {...(!shouldSwitchNetwork && { maxAmount: collateralBalance })}
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
