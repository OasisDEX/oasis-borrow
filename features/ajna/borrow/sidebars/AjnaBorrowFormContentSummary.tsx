import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import { AjnaValidationMessages } from 'features/ajna/common/components/AjnaValidationMessages'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormContentSummary() {
  const {
    form: { dispatch },
    validation: { errors, warnings },
  } = useAjnaProductContext('borrow')

  return (
    <>
      <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />
      <AjnaValidationMessages {...errors} />
      <AjnaValidationMessages {...warnings} />
      <AjnaBorrowFormOrder />
    </>
  )
}
