import { PillAccordion } from 'components/PillAccordion'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import { AjnaFormFieldWithdraw } from 'features/ajna/common/sidebars/AjnaFormFields'
import { AjnaEarnSlider } from 'features/ajna/earn/components/AjnaEarnSlider'
import { AjnaEarnFormContentSummary } from 'features/ajna/earn/sidebars/AjnaEarnFormContentSummary'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnFormContentWithdraw() {
  const { t } = useTranslation()
  const {
    form: {
      dispatch,
      state: { withdrawAmount },
    },
  } = useAjnaProductContext('earn')
  const {
    environment: { quoteBalance, quotePrice, quoteToken },
  } = useAjnaGeneralContext()

  return (
    <>
      <AjnaFormFieldWithdraw
        dispatchAmount={dispatch}
        token={quoteToken}
        tokenPrice={quotePrice}
        tokenBalance={quoteBalance}
        resetOnClear
      />
      <PillAccordion title={t('ajna.earn.manage.form.adjust-lending-price-bucket')}>
        <AjnaEarnSlider />
      </PillAccordion>
      {withdrawAmount && <AjnaEarnFormContentSummary />}
    </>
  )
}
