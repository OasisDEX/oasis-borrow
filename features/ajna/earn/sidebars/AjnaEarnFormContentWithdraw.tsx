import { PillAccordion } from 'components/PillAccordion'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import { AjnaFormFieldWithdraw } from 'features/ajna/common/sidebars/AjnaFormFields'
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

  return (
    <>
      <AjnaFormFieldWithdraw dispatchAmount={dispatch} resetOnClear />
      <PillAccordion title={t('ajna.earn.manage.form.adjust-lending-price-bucket')}>
        Test
      </PillAccordion>
      {withdrawAmount && <AjnaEarnFormContentSummary />}
    </>
  )
}
