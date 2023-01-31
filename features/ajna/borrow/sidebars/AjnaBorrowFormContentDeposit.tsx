import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import {
  AjnaBorrowFormFieldDeposit,
  AjnaBorrowFormFieldGenerate,
} from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormContentDeposit() {
  const {
    form: {
      dispatch,
      state: { depositAmount },
    },
  } = useAjnaBorrowContext()

  return (
    <>
      <AjnaBorrowFormFieldDeposit resetOnClear />
      <AjnaBorrowFormFieldGenerate isDisabled={!depositAmount || depositAmount?.lte(0)} />
      {depositAmount?.gt(0) && (
        <>
          <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />
          <AjnaBorrowFormOrder />
        </>
      )}
    </>
  )
}
