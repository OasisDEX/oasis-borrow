import { PillAccordion } from 'components/PillAccordion'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldWithdraw } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaMultiplySlider } from 'features/ajna/positions/multiply/components/AjnaMultiplySlider'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'
import React from 'react'
import { useTranslation } from 'react-i18next'

export function AjnaMultiplyFormContentWithdrawCollateral() {
  const { t } = useTranslation()
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
      <PillAccordion title={t('adjust-your-position-additional')}>
        <AjnaMultiplySlider disabled={!withdrawAmount} />
      </PillAccordion>
      {withdrawAmount && (
        <AjnaFormContentSummary>
          <AjnaMultiplyFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
