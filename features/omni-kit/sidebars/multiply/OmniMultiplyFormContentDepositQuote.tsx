import { OmniFormContentSummary } from 'features/omni-kit/common/sidebars/OmniFormContentSummary'
import { OmniFormFieldDeposit } from 'features/omni-kit/common/sidebars/OmniFormFields'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniMultiplyFormOrder } from 'features/omni-kit/sidebars/multiply/OmniMultiplyFormOrder'
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
  } = useOmniProductContext('multiply')

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
