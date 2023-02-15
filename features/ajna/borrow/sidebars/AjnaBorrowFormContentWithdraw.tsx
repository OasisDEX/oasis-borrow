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
} from 'features/ajna/borrow/validations'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { AutomationValidationMessages } from 'features/automation/common/sidebars/AutomationValidationMessages'
import React from 'react'

export function AjnaBorrowFormContentWithdraw() {
  const {
    form: {
      dispatch,
      state: { withdrawAmount },
    },
    validation: { errors, warnings },
  } = useAjnaBorrowContext()

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
