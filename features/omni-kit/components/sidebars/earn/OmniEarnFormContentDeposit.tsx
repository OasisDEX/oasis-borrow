import { OmniFormContentSummary, OmniFormFieldDeposit } from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import React from 'react'

export function OmniEarnFormContentDeposit() {
  const {
    environment: { quotePrice, quoteToken, quoteBalance, quoteDigits },
  } = useOmniGeneralContext()
  const {
    form: { dispatch },
    dynamicMetadata,
  } = useOmniProductContext('earn')

  const {
    validations: { isFormValid },
    elements: { extraEarnInputDeposit, earnFormOrder },
  } = dynamicMetadata

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
