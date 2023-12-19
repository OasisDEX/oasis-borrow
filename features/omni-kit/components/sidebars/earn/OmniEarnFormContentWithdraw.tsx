import {
  OmniFormContentSummary,
  OmniFormFieldWithdraw,
} from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function OmniEarnFormContentWithdraw() {
  const {
    environment: { quotePrice, quoteToken, quoteDigits, quotePrecision },
  } = useOmniGeneralContext()
  const {
    form: { dispatch },

    dynamicMetadata: {
      validations: { isFormValid },
      elements: { extraEarnInputWithdraw, earnFormOrder },
      values: { earnWithdrawMax },
    },
  } = useOmniProductContext(OmniProductType.Earn)

  return (
    <>
      <OmniFormFieldWithdraw
        dispatchAmount={dispatch}
        resetOnClear
        token={quoteToken}
        tokenPrice={quotePrice}
        maxAmount={earnWithdrawMax}
        tokenDigits={quoteDigits}
        tokenPrecision={quotePrecision}
      />
      {extraEarnInputWithdraw}
      {isFormValid && <OmniFormContentSummary>{earnFormOrder}</OmniFormContentSummary>}
    </>
  )
}
