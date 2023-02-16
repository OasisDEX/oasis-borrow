import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { useAjnaBorrowContext } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import { AjnaValidationMessages } from 'features/ajna/components/AjnaValidationMessages'
import React from 'react'

export function AjnaBorrowFormContentSummary() {
  const {
    form: { dispatch },
    validation: { errors, warnings },
  } = useAjnaBorrowContext()

  return (
    <>
      <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />
      <AjnaValidationMessages {...errors} />
      <AjnaValidationMessages {...warnings} />
      <AjnaBorrowFormOrder />
    </>
  )
}
