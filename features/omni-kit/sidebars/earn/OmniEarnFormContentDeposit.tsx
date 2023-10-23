import { OmniFormContentSummary } from 'features/omni-kit/common/sidebars/OmniFormContentSummary'
import { OmniFormFieldDeposit } from 'features/omni-kit/common/sidebars/OmniFormFields'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
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
  } = dynamicMetadata('earn')

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
