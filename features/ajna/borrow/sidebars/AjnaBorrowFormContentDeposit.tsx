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
} from 'features/ajna/borrow/validations'
import { AjnaValidationMessages } from 'features/ajna/components/AjnaValidationMessages'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormContentDeposit() {
  const {
    form: {
      dispatch,
      state: { depositAmount },
    },
    validation: { errors, warnings },
  } = useAjnaBorrowContext()

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
