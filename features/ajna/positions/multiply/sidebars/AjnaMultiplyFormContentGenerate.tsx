import React from 'react'
import { getToken } from 'blockchain/tokensMetadata'
import { getAjnaBorrowDebtMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMax'
import { getAjnaBorrowDebtMin } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMin'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldGenerate } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'

export function AjnaMultiplyFormContentGenerate() {
  const {
    environment: { quoteToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { generateAmount },
    },
    position: {
      currentPosition: { position, simulation },
    },
  } = useAjnaProductContext('multiply')

  const debtMin = getAjnaBorrowDebtMin({ digits: getToken(quoteToken).digits, position })
  const debtMax = getAjnaBorrowDebtMax({
    digits: getToken(quoteToken).precision,
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
      {generateAmount && (
        <AjnaFormContentSummary>
          <AjnaMultiplyFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
