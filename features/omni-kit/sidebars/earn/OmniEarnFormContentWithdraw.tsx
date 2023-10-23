import { OmniFormContentSummary } from 'features/omni-kit/common/sidebars/OmniFormContentSummary'
import { OmniFormFieldWithdraw } from 'features/omni-kit/common/sidebars/OmniFormFields'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import React from 'react'

export function OmniEarnFormContentWithdraw() {
  const {
    environment: { quotePrice, quoteToken, quoteDigits },
  } = useOmniGeneralContext()
  const {
    form: { dispatch },

    dynamicMetadata,
  } = useOmniProductContext('earn')
  const {
    validations: { isFormValid },
    elements: { extraEarnInputWithdraw, earnFormOrder },
    values: { earnWithdrawMax },
  } = dynamicMetadata('earn')

  return (
    <>
      <OmniFormFieldWithdraw
        dispatchAmount={dispatch}
        resetOnClear
        token={quoteToken}
        tokenPrice={quotePrice}
        maxAmount={earnWithdrawMax}
        tokenDigits={quoteDigits}
      />
      {extraEarnInputWithdraw}
      {isFormValid && <OmniFormContentSummary>{earnFormOrder}</OmniFormContentSummary>}
    </>
  )
}
