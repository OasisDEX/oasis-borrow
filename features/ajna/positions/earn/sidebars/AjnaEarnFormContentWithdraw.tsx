import { getToken } from 'blockchain/tokensMetadata'
import { PillAccordion } from 'components/PillAccordion'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldWithdraw } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaEarnSlider } from 'features/ajna/positions/earn/components/AjnaEarnSlider'
import { getAjnaEarnWithdrawMax } from 'features/ajna/positions/earn/helpers/getAjnaEarnWithdrawMax'
import { AjnaEarnFormOrder } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormOrder'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnFormContentWithdraw() {
  const { t } = useTranslation()
  const {
    environment: { quotePrice, quoteToken },
  } = useAjnaGeneralContext()
  const {
    form: { dispatch },
    validation: { isFormValid },
    position: {
      currentPosition: {
        position: { quoteTokenAmount },
      },
    },
  } = useAjnaProductContext('earn')

  const withdrawMax = getAjnaEarnWithdrawMax({
    quoteTokenAmount,
    digits: getToken(quoteToken).precision,
  })

  return (
    <>
      <AjnaFormFieldWithdraw
        dispatchAmount={dispatch}
        resetOnClear
        token={quoteToken}
        tokenPrice={quotePrice}
        maxAmount={withdrawMax}
      />
      <PillAccordion title={t('ajna.position-page.earn.common.form.adjust-lending-price-bucket')}>
        <AjnaEarnSlider />
      </PillAccordion>
      {isFormValid && (
        <AjnaFormContentSummary>
          <AjnaEarnFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
