import { OmniFormContentSummary, OmniFormFieldDeposit } from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function OmniEarnFormContentDeposit() {
  const {
    environment: { quotePrice, quoteToken, quoteBalance, quoteDigits },
  } = useOmniGeneralContext()
  const {
    form: { dispatch },
    dynamicMetadata: {
      validations: { isFormValid },
      elements: { extraEarnInputDeposit, earnFormOrder },
    },
  } = useOmniProductContext(OmniProductType.Earn)

  return (
    <>
      <OmniFormFieldDeposit
        dispatchAmount={dispatch}
        resetOnClear
        token={quoteToken}
        tokenPrice={quotePrice}
        maxAmount={quoteBalance}
        tokenDigits={quoteDigits}
      />
      {extraEarnInputDeposit}
      {isFormValid && <OmniFormContentSummary>{earnFormOrder}</OmniFormContentSummary>}
    </>
  )
}
