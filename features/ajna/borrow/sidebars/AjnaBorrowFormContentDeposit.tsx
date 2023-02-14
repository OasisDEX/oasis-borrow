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

export function AjnaBorrowFormContentDeposit() {
  const {
    environment: { collateralBalance, ethPrice, ethBalance, collateralToken, quoteBalance },
    form: {
      dispatch,
      state: { depositAmount, paybackAmount },
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
    paybackAmount,
    collateralBalance,
    quoteBalance,
    simulationErrors: simulation?.errors,
    simulationWarnings: simulation?.errors,
    txError: txDetails?.txError,
    collateralToken,
  })

  return (
    <>
      <AjnaBorrowFormFieldDeposit resetOnClear />
      <AjnaValidationMessages
        {...errors}
        messages={errors.messages.filter((message) => ajnaDepositErrors.includes(message))}
      />
      <AjnaValidationMessages
        {...warnings}
        messages={warnings.messages.filter((message) => ajnaDepositWarnings.includes(message))}
      />
      <AjnaBorrowFormFieldGenerate isDisabled={!depositAmount || depositAmount?.lte(0)} />
      <AjnaValidationMessages
        {...errors}
        messages={errors.messages.filter((message) =>
          [...ajnaCommonErrors, ...ajnaGenerateErrors].includes(message),
        )}
      />
      <AjnaValidationMessages
        {...warnings}
        messages={warnings.messages.filter((message) =>
          [...ajnaCommonWarnings, ...ajnaGenerateWarnings].includes(message),
        )}
      />
      {depositAmount && (
        <>
          <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />
          <AjnaBorrowFormOrder />
        </>
      )}
    </>
  )
}
