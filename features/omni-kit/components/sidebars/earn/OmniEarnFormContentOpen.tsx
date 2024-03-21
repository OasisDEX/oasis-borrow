import { OmniFormContentSummary, OmniFormFieldDeposit } from 'features/omni-kit/components/sidebars'
import { OmniInputSwap } from 'features/omni-kit/components/sidebars/OmniInputSwap'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function OmniEarnFormContentOpen() {
  const {
    environment: {
      quoteAddress,
      quoteBalance,
      quoteDigits,
      quotePrecision,
      quotePrice,
      quoteToken,
    },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { pullToken },
    },
    dynamicMetadata: {
      validations: { isFormValid },
      elements: { extraEarnInput, earnFormOrder },
    },
  } = useOmniProductContext(OmniProductType.Earn)

  return (
    <>
      <OmniInputSwap
        defaultToken={quoteToken}
        defaultTokenBalance={quoteBalance}
        defaultTokenPrice={quotePrice}
        defaultTokenAddress={quoteAddress}
        defaultTokenPrecision={quotePrecision}
        type="pull"
      >
        {({ swapController }) => (
          <OmniFormFieldDeposit
            dispatchAmount={dispatch}
            token={pullToken?.token ?? quoteToken}
            tokenPrice={pullToken?.price ?? quotePrice}
            maxAmount={pullToken?.balance ?? quoteBalance}
            tokenDigits={pullToken?.digits ?? quoteDigits}
            tokenPrecision={pullToken?.precision ?? quotePrecision}
            resetOnClear
            swapController={swapController}
          />
        )}
      </OmniInputSwap>
      {extraEarnInput}
      {isFormValid && <OmniFormContentSummary>{earnFormOrder}</OmniFormContentSummary>}
    </>
  )
}
