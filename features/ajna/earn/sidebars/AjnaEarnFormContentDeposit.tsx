import { PillAccordion } from 'components/PillAccordion'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import { AjnaFormFieldDeposit } from 'features/ajna/common/sidebars/AjnaFormFields'
import { AjnaEarnSlider } from 'features/ajna/earn/components/AjnaEarnSlider'
import { AjnaEarnFormContentSummary } from 'features/ajna/earn/sidebars/AjnaEarnFormContentSummary'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnFormContentDeposit() {
  const { t } = useTranslation()
  const {
    form: {
      dispatch,
      state: { depositAmount },
    },
  } = useAjnaProductContext('earn')
  const {
    environment: { quoteBalance, quotePrice, quoteToken },
  } = useAjnaGeneralContext()

  return (
    <>
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        token={quoteToken}
        tokenPrice={quotePrice}
        tokenBalance={quoteBalance}
        resetOnClear
      />
      <PillAccordion title={t('ajna.earn.manage.form.adjust-lending-price-bucket')}>
        <AjnaEarnSlider />
      </PillAccordion>
      {depositAmount && <AjnaEarnFormContentSummary />}
    </>
  )
}
