import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldDeposit } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaEarnSlider } from 'features/ajna/positions/earn/components/AjnaEarnSlider'
import { AjnaEarnFormOrder } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormOrder'
import React from 'react'

export function AjnaEarnFormContentOpen() {
  const {
    environment: { quotePrice, quoteToken, quoteBalance, quotePrecision, isOracless },
  } = useAjnaGeneralContext()
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
  } = useAjnaProductContext('earn')

  return (
    <>
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        token={quoteToken}
        tokenPrice={quotePrice}
        maxAmount={quoteBalance}
        tokenPrecision={quotePrecision}
        resetOnClear
      />
      <AjnaEarnSlider
        isDisabled={!depositAmount || depositAmount?.lte(0)}
        nestedManualInput={!(isOracless && pool.lowestUtilizedPriceIndex.isZero())}
      />
      {isFormValid && (
        <AjnaFormContentSummary>
          <AjnaEarnFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
