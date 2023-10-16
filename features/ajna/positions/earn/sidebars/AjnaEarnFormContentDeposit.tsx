import { PillAccordion } from 'components/PillAccordion'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldDeposit } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaEarnSlider } from 'features/ajna/positions/earn/components/AjnaEarnSlider'
import { AjnaEarnFormOrder } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormOrder'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnFormContentDeposit() {
  const { t } = useTranslation()
  const {
    environment: { quotePrice, quoteToken, quoteBalance, quoteDigits, isOracless },
  } = useProtocolGeneralContext()
  const {
    form: {
      dispatch,
      state: { depositAmount },
    },
    position: {
      currentPosition: {
        position: { pool },
      },
    },
    validation: { isFormValid },
    staticMetadata: {
      customHehe: { extraInput },
    },
    dynamicMetadata,
  } = useGenericProductContext('earn')

  const test = dynamicMetadata('earn')
  console.log('test', test)
  return (
    <>
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        resetOnClear
        token={quoteToken}
        tokenPrice={quotePrice}
        maxAmount={quoteBalance}
        tokenDigits={quoteDigits}
      />
      {extraInput}
      <PillAccordion title={t('ajna.position-page.earn.common.form.adjust-lending-price-bucket')}>
        <AjnaEarnSlider
          isDisabled={!depositAmount}
          nestedManualInput={!(isOracless && pool.lowestUtilizedPriceIndex.isZero())}
        />
      </PillAccordion>
      {isFormValid && (
        <AjnaFormContentSummary>
          <AjnaEarnFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
