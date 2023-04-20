import { getToken } from 'blockchain/tokensMetadata'
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
    environment: { collateralBalance, collateralPrice, collateralToken, quoteToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { generateAmount },
    },
    position: {
      currentPosition: { position, simulation },
    },
  } = useAjnaProductContext('borrow')

  const debtMin = getAjnaBorrowDebtMin({ digits: getToken(quoteToken).digits, position })
  const debtMax = getAjnaBorrowDebtMax({
    precision: getToken(quoteToken).precision,
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
        isDisabled={!generateAmount || generateAmount?.lte(0)}
        maxAmount={collateralBalance}
        token={collateralToken}
        tokenPrice={collateralPrice}
      />
      {generateAmount && (
        <>
          <AjnaBorrowOriginationFee />
          <AjnaFormContentSummary>
            <AjnaBorrowFormOrder />
          </AjnaFormContentSummary>
        </>
      )}
    </>
  )
}
