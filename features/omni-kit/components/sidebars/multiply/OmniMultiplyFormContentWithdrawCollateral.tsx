import {
  OmniFormContentSummary,
  OmniFormFieldWithdraw,
} from 'features/omni-kit/components/sidebars'
import { OmniMultiplyFormOrder } from 'features/omni-kit/components/sidebars/multiply'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import React from 'react'

export function OmniMultiplyFormContentWithdrawCollateral() {
  const {
    environment: { collateralPrice, collateralToken },
  } = useOmniGeneralContext()
  const {
    form: {
      dispatch,
      state: { withdrawAmount },
    },
    dynamicMetadata: {
      values: { collateralMax },
    },
  } = useOmniProductContext('multiply')

  return (
    <>
      <OmniFormFieldWithdraw
        dispatchAmount={dispatch}
        maxAmount={collateralMax}
        resetOnClear
        token={collateralToken}
        tokenPrice={collateralPrice}
      />
      {/* DISABLED: We're currently unable to support this operation
       * in the library based on existing operation if the LTV increases
       * added to product continuous improvements backlog
       * https://app.shortcut.com/oazo-apps/story/10552/multiply-withdrawal-ltv-increases-are-not-supported-in-operation
       */}
      {/*<PillAccordion title={t('adjust-your-position-additional')}>*/}
      {/*  <AjnaMultiplySlider disabled={!withdrawAmount} />*/}
      {/*</PillAccordion>*/}
      {withdrawAmount && (
        <OmniFormContentSummary>
          <OmniMultiplyFormOrder />
        </OmniFormContentSummary>
      )}
    </>
  )
}
