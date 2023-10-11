import { AjnaBorrowOriginationFee } from 'features/ajna/positions/borrow/controls/AjnaBorrowOriginationFee'
import { getAjnaBorrowDebtMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMax'
import { getAjnaBorrowDebtMin } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMin'
import { AjnaBorrowFormOrder } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import {
  AjnaFormFieldDeposit,
  AjnaFormFieldGenerate,
} from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import React from 'react'

export function AjnaBorrowFormContentDeposit() {
  const {
    environment: {
      collateralBalance,
      collateralDigits,
      collateralPrice,
      collateralToken,
      quoteDigits,
    },
  } = useProtocolGeneralContext()
  const {
    form: {
      dispatch,
      state: { depositAmount, generateAmount },
    },
    position: {
      currentPosition: { position, simulation },
    },
  } = useAjnaProductContext('borrow')

  const debtMin = getAjnaBorrowDebtMin({ digits: quoteDigits, position })
  const debtMax = getAjnaBorrowDebtMax({
    digits: quoteDigits,
    position,
    simulation,
  })

  return (
    <>
      <AjnaFormFieldDeposit
        dispatchAmount={dispatch}
        maxAmount={collateralBalance}
        resetOnClear
        token={collateralToken}
        tokenPrice={collateralPrice}
        tokenDigits={collateralDigits}
      />
      <AjnaFormFieldGenerate dispatchAmount={dispatch} maxAmount={debtMax} minAmount={debtMin} />
      {generateAmount && <AjnaBorrowOriginationFee />}
      {(depositAmount || generateAmount) && (
        <AjnaFormContentSummary>
          <AjnaBorrowFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
