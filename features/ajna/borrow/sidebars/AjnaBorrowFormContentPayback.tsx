import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import {
  AjnaBorrowFormFieldPayback,
  AjnaBorrowFormFieldWithdraw,
} from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import {
  ajnaCommonErrors,
  ajnaCommonWarnings,
  ajnaPaybackErrors,
  ajnaPaybackWarnings,
  ajnaWithdrawErrors,
  ajnaWithdrawWarnings,
  getAjnaBorrowValidations,
} from 'features/ajna/borrow/validations'
import { AjnaValidationMessages } from 'features/ajna/components/AjnaValidationMessages'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormContentPayback() {
  const {
    environment: { collateralBalance, ethPrice, ethBalance, collateralToken, quoteBalance },
    form: {
      dispatch,
      state: { paybackAmount, depositAmount },
    },
    tx: { txDetails },
    position: { simulation },
  } = useAjnaBorrowContext()
  const gasEstimation = useGasEstimationContext()

  const { errors, warnings } = getAjnaBorrowValidations({
    ethPrice,
    ethBalance,
    gasEstimationUsd: gasEstimation?.usdValue,
    collateralBalance,
    quoteBalance,
    depositAmount,
    paybackAmount,
    simulationErrors: simulation?.errors,
    simulationWarnings: simulation?.errors,
    txError: txDetails?.txError,
    collateralToken,
  })

  return (
    <>
      <AjnaBorrowFormFieldPayback resetOnClear />
      <AjnaValidationMessages
        {...errors}
        messages={errors.messages.filter((message) => ajnaPaybackErrors.includes(message))}
      />
      <AjnaValidationMessages
        {...warnings}
        messages={warnings.messages.filter((message) => ajnaPaybackWarnings.includes(message))}
      />
      <AjnaBorrowFormFieldWithdraw isDisabled={!paybackAmount || paybackAmount?.lte(0)} />
      <AjnaValidationMessages
        {...errors}
        messages={errors.messages.filter((message) =>
          [...ajnaCommonErrors, ...ajnaWithdrawErrors].includes(message),
        )}
      />
      <AjnaValidationMessages
        {...warnings}
        messages={warnings.messages.filter((message) =>
          [...ajnaCommonWarnings, ...ajnaWithdrawWarnings].includes(message),
        )}
      />
      {paybackAmount && (
        <>
          <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />
          <AjnaBorrowFormOrder />
        </>
      )}
    </>
  )
}
