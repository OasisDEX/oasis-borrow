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
      shouldSwitchNetwork,
    },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { pullToken },
    },
    dynamicMetadata: {
      elements: { extraEarnInput, earnFormOrder },
      validations: { isFormValid },
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
            resetOnClear
            swapController={swapController}
            token={pullToken?.token ?? quoteToken}
            tokenDigits={pullToken?.digits ?? quoteDigits}
            tokenPrecision={pullToken?.precision ?? quotePrecision}
            tokenPrice={pullToken?.price ?? quotePrice}
            {...(!shouldSwitchNetwork && { maxAmount: pullToken?.balance ?? quoteBalance })}
          />
        )}
      </OmniInputSwap>
      {extraEarnInput}
      {isFormValid && <OmniFormContentSummary>{earnFormOrder}</OmniFormContentSummary>}
    </>
  )
}
