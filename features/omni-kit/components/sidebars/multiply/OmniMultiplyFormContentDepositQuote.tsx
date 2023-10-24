import { OmniFormContentSummary, OmniFormFieldDeposit } from 'features/omni-kit/components/sidebars'
import { OmniMultiplyFormOrder } from 'features/omni-kit/components/sidebars/multiply'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function OmniMultiplyFormContentDepositQuote() {
  const {
    environment: { quoteBalance, quotePrice, quoteToken },
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
        maxAmount={quoteBalance}
        resetOnClear
        token={quoteToken}
        tokenPrice={quotePrice}
      />
      {/* TODO uncomment once action will be handled */}
      {/*<PillAccordion title={t('adjust-your-position-additional')}>*/}
      {/*  <OmniMultiplySlider disabled={!depositAmount} />*/}
      {/*</PillAccordion>*/}
      {depositAmount && (
        <OmniFormContentSummary>
          <OmniMultiplyFormOrder />
        </OmniFormContentSummary>
      )}
    </>
  )
}
