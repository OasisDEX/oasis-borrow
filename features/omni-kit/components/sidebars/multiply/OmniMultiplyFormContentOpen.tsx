import {
  OmniAdjustSlider,
  OmniFormContentSummary,
  OmniFormFieldDeposit,
} from 'features/omni-kit/components/sidebars'
import { OmniMultiplyFormOrder } from 'features/omni-kit/components/sidebars/multiply'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function OmniMultiplyFormContentOpen() {
  const {
    environment: { shouldSwitchNetwork, entryToken },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { depositAmount },
    },
  } = useOmniProductContext(OmniProductType.Multiply)

  return (
    <>
      <OmniFormFieldDeposit
        dispatchAmount={dispatch}
        maxAmount={entryToken.balance}
        resetOnClear
        token={entryToken.symbol}
        tokenPrice={entryToken.price}
        tokenPrecision={entryToken.precision}
        {...(!shouldSwitchNetwork && { maxAmount: entryToken.balance })}
      />
      <OmniAdjustSlider disabled={!depositAmount} />
      {depositAmount && (
        <OmniFormContentSummary>
          <OmniMultiplyFormOrder />
        </OmniFormContentSummary>
      )}
    </>
  )
}
