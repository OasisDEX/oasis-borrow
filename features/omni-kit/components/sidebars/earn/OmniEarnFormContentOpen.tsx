import { OmniFormContentSummary, OmniFormFieldDeposit } from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import React from 'react'

export function OmniEarnFormContentOpen() {
  const {
    environment: { quotePrice, quoteToken, quoteBalance, quoteDigits },
  } = useOmniGeneralContext()
  const {
    form: { dispatch },
    dynamicMetadata,
  } = useOmniProductContext('earn')

  const {
    validations: { isFormValid },
    elements: { extraEarnInput, earnFormOrder },
  } = dynamicMetadata

  return (
    <>
      <OmniFormFieldDeposit
        dispatchAmount={dispatch}
        token={quoteToken}
        tokenPrice={quotePrice}
        maxAmount={quoteBalance}
        tokenDigits={quoteDigits}
        resetOnClear
      />
      {extraEarnInput}
      {isFormValid && <OmniFormContentSummary>{earnFormOrder}</OmniFormContentSummary>}
    </>
  )
}
