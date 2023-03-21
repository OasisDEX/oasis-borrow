import BigNumber from 'bignumber.js'
import { getAjnaBorrowCollateralMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowCollateralMax'
import { AjnaBorrowFormOrder } from 'features/ajna/positions/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import {
  AjnaFormFieldPayback,
  AjnaFormFieldWithdraw,
} from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import React from 'react'

export function AjnaBorrowFormContentWithdraw() {
  const {
    environment: { collateralPrice, collateralToken, quoteBalance },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { withdrawAmount },
    },
    position: {
      currentPosition: { position, simulation },
    },
  } = useAjnaProductContext('borrow')

  const collateralMax = getAjnaBorrowCollateralMax({ position, simulation })
  const { debtAmount } = position

  return (
    <>
      <AjnaFormFieldWithdraw
        dispatchAmount={dispatch}
        maxAmount={collateralMax}
        resetOnClear
        token={collateralToken}
        tokenPrice={collateralPrice}
      />
      <AjnaFormFieldPayback
        dispatchAmount={dispatch}
        isDisabled={!withdrawAmount || withdrawAmount?.lte(0)}
        maxAmount={BigNumber.min(debtAmount, quoteBalance)}
        maxAmountLabel={quoteBalance.lt(debtAmount) ? 'balance' : 'max'}
      />
      {withdrawAmount && (
        <AjnaFormContentSummary>
          <AjnaBorrowFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
