import { AjnaAdjustSlider } from 'features/ajna/positions/common/components/AjnaAdjustSlider'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldDeposit } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'
import React from 'react'

export function AjnaMultiplyFormContentOpen() {
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
      <AjnaAdjustSlider disabled={!depositAmount} />
      {depositAmount && (
        <AjnaFormContentSummary>
          <AjnaMultiplyFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
