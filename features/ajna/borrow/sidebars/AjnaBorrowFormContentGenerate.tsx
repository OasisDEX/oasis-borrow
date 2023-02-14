import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import {
  AjnaBorrowFormFieldDeposit,
  AjnaBorrowFormFieldGenerate,
} from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import {
  ajnaCommonErrors,
  ajnaCommonWarnings,
  ajnaDepositErrors,
  ajnaDepositWarnings,
  ajnaGenerateErrors,
  ajnaGenerateWarnings,
  getAjnaBorrowValidations,
} from 'features/ajna/borrow/validations'
import { AjnaValidationMessages } from 'features/ajna/components/AjnaValidationMessages'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormContentGenerate() {
  const {
    environment: { collateralBalance, ethPrice, ethBalance, collateralToken, quoteBalance },
    form: {
      dispatch,
      state: { generateAmount, depositAmount },
    },
    tx: { txDetails },
    position: { simulation },
  } = useAjnaBorrowContext()
  const gasEstimation = useGasEstimationContext()

  const { errors, warnings } = getAjnaBorrowValidations({
    ethPrice,
    ethBalance,
    gasEstimationUsd: gasEstimation?.usdValue,
    depositAmount,
    collateralBalance,
    quoteBalance,
    simulationErrors: simulation?.errors,
    simulationWarnings: simulation?.errors,
    txError: txDetails?.txError,
    collateralToken,
  })

  return (
    <>
      <AjnaBorrowFormFieldGenerate resetOnClear />
      <AjnaValidationMessages
        {...errors}
        messages={errors.messages.filter((message) => ajnaGenerateErrors.includes(message))}
      />
      <AjnaValidationMessages
        {...warnings}
        messages={warnings.messages.filter((message) => ajnaGenerateWarnings.includes(message))}
      />
      <AjnaBorrowFormFieldDeposit isDisabled={!generateAmount || generateAmount?.lte(0)} />
      <AjnaValidationMessages
        {...errors}
        messages={errors.messages.filter((message) =>
          [...ajnaDepositErrors, ...ajnaCommonErrors].includes(message),
        )}
      />
      <AjnaValidationMessages
        {...warnings}
        messages={warnings.messages.filter((message) =>
          [...ajnaDepositWarnings, ...ajnaCommonWarnings].includes(message),
        )}
      />
      {generateAmount && (
        <>
          <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />
          <AjnaBorrowFormOrder />
        </>
      )}
    </>
  )
}
