import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldDeposit } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaEarnSlider } from 'features/ajna/positions/earn/components/AjnaEarnSlider'
import { AjnaEarnFormOrder } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormOrder'
import React from 'react'

export function AjnaEarnFormContentOpen() {
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
  } = useGenericProductContext('earn')

  return (
    <>
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        token={quoteToken}
        tokenPrice={quotePrice}
        maxAmount={quoteBalance}
        tokenDigits={quoteDigits}
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
