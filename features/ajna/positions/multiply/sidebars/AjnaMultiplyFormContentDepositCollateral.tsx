import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldDeposit } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'
import React from 'react'

export function AjnaMultiplyFormContentDepositCollateral() {
  // const { t } = useTranslation()
  const {
    environment: { collateralBalance, collateralPrice, collateralToken },
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
        maxAmount={collateralBalance}
        resetOnClear
        token={collateralToken}
        tokenPrice={collateralPrice}
      />
      {/* DISABLED: We're currently unable to support this operation
       * in the library based on existing operation if the LTV decreases
       * added to product continuous improvements backlog
       * https://app.shortcut.com/oazo-apps/story/10553/multiply-deposit-ltv-decreases-are-not-supported-in-operation
       */}
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
