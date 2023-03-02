import { PillAccordion } from 'components/PillAccordion'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldDeposit } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaEarnSlider } from 'features/ajna/positions/earn/components/AjnaEarnSlider'
import { AjnaEarnFormOrder } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormOrder'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnFormContentDeposit() {
  const { t } = useTranslation()
  const {
    environment: { quoteBalance, quotePrice, quoteToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { depositAmount },
    },
  } = useAjnaProductContext('earn')

  return (
    <>
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        resetOnClear
        token={quoteToken}
        tokenBalance={quoteBalance}
        tokenPrice={quotePrice}
      />
      <PillAccordion title={t('ajna.earn.manage.form.adjust-lending-price-bucket')}>
        <AjnaEarnSlider />
      </PillAccordion>
      {depositAmount && (
        <AjnaFormContentSummary>
          <AjnaEarnFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
