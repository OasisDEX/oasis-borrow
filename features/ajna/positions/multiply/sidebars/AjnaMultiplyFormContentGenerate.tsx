import { getToken } from 'blockchain/tokensMetadata'
import { getAjnaBorrowDebtMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMax'
import { getAjnaBorrowDebtMin } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowDebtMin'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldGenerate } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'
import React from 'react'

export function AjnaMultiplyFormContentGenerate() {
  const {
    environment: { quoteToken },
  } = useProtocolGeneralContext()
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
