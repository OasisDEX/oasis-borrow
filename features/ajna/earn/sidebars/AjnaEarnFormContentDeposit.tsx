import { PillAccordion } from 'components/PillAccordion'
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

  return (
    <>
      <AjnaFormFieldDeposit dispatchAmount={dispatch} resetOnClear />
      <PillAccordion title={t('ajna.earn.manage.form.adjust-lending-price-bucket')}>
        <AjnaEarnSlider />
      </PillAccordion>
      {depositAmount && <AjnaEarnFormContentSummary />}
    </>
  )
}
