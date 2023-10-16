// import { PillAccordion } from 'components/PillAccordion'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldDeposit } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
// import { AjnaMultiplySlider } from 'features/ajna/positions/multiply/components/AjnaMultiplySlider'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'
import React from 'react'
// import { useTranslation } from 'react-i18next'

export function AjnaMultiplyFormContentDepositQuote() {
  // const { t } = useTranslation()
  const {
    environment: { quoteBalance, quotePrice, quoteToken },
  } = useProtocolGeneralContext()
  const {
    form: {
      dispatch,
      state: { depositAmount },
    },
  } = useGenericProductContext('multiply')

  return (
    <>
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        maxAmount={quoteBalance}
        resetOnClear
        token={quoteToken}
        tokenPrice={quotePrice}
      />
      {/* TODO uncomment once action will be handled */}
      {/*<PillAccordion title={t('adjust-your-position-additional')}>*/}
      {/*  <AjnaMultiplySlider disabled={!depositAmount} />*/}
      {/*</PillAccordion>*/}
      {depositAmount && (
        <AjnaFormContentSummary>
          <AjnaMultiplyFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
