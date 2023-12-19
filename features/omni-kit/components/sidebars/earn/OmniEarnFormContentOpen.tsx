import { OmniFormContentSummary, OmniFormFieldDeposit } from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function OmniEarnFormContentOpen() {
  const {
    environment: { quotePrice, quoteToken, quoteBalance, quoteDigits, quotePrecision },
  } = useOmniGeneralContext()
  const {
    form: { dispatch },
    dynamicMetadata: {
      validations: { isFormValid },
      elements: { extraEarnInput, earnFormOrder },
    },
  } = useOmniProductContext(OmniProductType.Earn)

  return (
    <>
      <OmniFormFieldDeposit
        dispatchAmount={dispatch}
        token={quoteToken}
        tokenPrice={quotePrice}
        maxAmount={quoteBalance}
        tokenDigits={quoteDigits}
        tokenPrecision={quotePrecision}
        resetOnClear
      />
      {extraEarnInput}
      {isFormValid && <OmniFormContentSummary>{earnFormOrder}</OmniFormContentSummary>}
    </>
  )
}
