import { AjnaBorrowOriginationFee } from 'features/ajna/positions/borrow/controls/AjnaBorrowOriginationFee'
import { getAjnaBorrowDebtMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMax'
import { getAjnaBorrowDebtMin } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMin'
import { AjnaBorrowFormOrder } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import {
  AjnaFormFieldDeposit,
  AjnaFormFieldGenerate,
} from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import React from 'react'

export function AjnaBorrowFormContentGenerate() {
  const {
    environment: {
      collateralDigits,
      collateralBalance,
      collateralPrecision,
      collateralPrice,
      collateralToken,
      quoteDigits,
    },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { generateAmount, depositAmount },
    },
    position: {
      currentPosition: { position, simulation },
    },
  } = useAjnaProductContext('borrow')

  const debtMin = getAjnaBorrowDebtMin({ digits: collateralDigits, position })
  const debtMax = getAjnaBorrowDebtMax({
    precision: quoteDigits,
    position,
    simulation,
  })

  return (
    <>
      <AjnaFormFieldGenerate
        dispatchAmount={dispatch}
        maxAmount={debtMax}
        minAmount={debtMin}
        resetOnClear
      />
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        maxAmount={collateralBalance}
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenPrecision={collateralPrecision}
      />
      {generateAmount && <AjnaBorrowOriginationFee />}
      {(generateAmount || depositAmount) && (
        <>
          <AjnaFormContentSummary>
            <AjnaBorrowFormOrder />
          </AjnaFormContentSummary>
        </>
      )}
    </>
  )
}
