import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldWithdraw } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'
import React from 'react'

export function AjnaMultiplyFormContentWithdrawCollateral() {
  // const { t } = useTranslation()
  const {
    environment: { collateralPrice, collateralToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { withdrawAmount },
    },
  } = useAjnaProductContext('multiply')

  return (
    <>
      <AjnaFormFieldWithdraw
        dispatchAmount={dispatch}
        // maxAmount={collateralMax}
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
        <AjnaFormContentSummary>
          <AjnaMultiplyFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
