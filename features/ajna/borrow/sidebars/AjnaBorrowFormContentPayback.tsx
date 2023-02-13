import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import {
  AjnaBorrowFormFieldPayback,
  AjnaBorrowFormFieldWithdraw,
} from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormContentPayback() {
  const {
    form: {
      dispatch,
      state: { paybackAmount },
    },
  } = useAjnaBorrowContext()

  return (
    <>
      <AjnaBorrowFormFieldPayback resetOnClear />
      <AjnaBorrowFormFieldWithdraw isDisabled={!paybackAmount || paybackAmount?.lte(0)} />
      {paybackAmount && (
        <>
          <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />
          <AjnaBorrowFormOrder />
        </>
      )}
    </>
  )
}
