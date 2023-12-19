import { OmniFormContentSummary, OmniFormFieldDeposit } from 'features/omni-kit/components/sidebars'
import { OmniMultiplyFormOrder } from 'features/omni-kit/components/sidebars/multiply'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function OmniMultiplyFormContentDepositCollateral() {
  const {
    environment: {
      collateralBalance,
      collateralPrice,
      collateralToken,
      shouldSwitchNetwork,
      collateralPrecision,
    },
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
        resetOnClear
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenPrecision={collateralPrecision}
        {...(!shouldSwitchNetwork && { maxAmount: collateralBalance })}
      />
      {/* DISABLED: We're currently unable to support this operation
       * in the library based on existing operation if the LTV decreases
       * added to product continuous improvements backlog
       * https://app.shortcut.com/oazo-apps/story/10553/multiply-deposit-ltv-decreases-are-not-supported-in-operation
       */}
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
