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
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { AutomationValidationMessages } from 'features/automation/common/sidebars/AutomationValidationMessages'
import React from 'react'

export function AjnaBorrowFormContentWithdraw() {
  const {
    environment: { collateralBalance, ethPrice, ethBalance, collateralToken, quoteBalance },
    form: {
      dispatch,
      state: { withdrawAmount },
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
    simulationErrors: simulation?.errors,
    simulationWarnings: simulation?.errors,
    txError: txDetails?.txError,
    collateralToken,
  })

  return (
    <>
      <AjnaBorrowFormFieldWithdraw resetOnClear />
      <AutomationValidationMessages
        {...errors}
        messages={errors.messages.filter((message) => ajnaWithdrawErrors.includes(message))}
      />
      <AutomationValidationMessages
        {...warnings}
        messages={warnings.messages.filter((message) => ajnaWithdrawWarnings.includes(message))}
      />
      <AjnaBorrowFormFieldPayback isDisabled={!withdrawAmount || withdrawAmount?.lte(0)} />
      <AutomationValidationMessages
        {...errors}
        messages={errors.messages.filter((message) =>
          [...ajnaCommonErrors, ...ajnaPaybackErrors].includes(message),
        )}
      />
      <AutomationValidationMessages
        {...warnings}
        messages={warnings.messages.filter((message) =>
          [...ajnaCommonWarnings, ...ajnaPaybackWarnings].includes(message),
        )}
      />
      {withdrawAmount && (
        <>
          <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />
          <AjnaBorrowFormOrder />
        </>
      )}
    </>
  )
}
