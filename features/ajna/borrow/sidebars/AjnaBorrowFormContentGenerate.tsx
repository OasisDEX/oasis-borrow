import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import {
  AjnaBorrowFormFieldDeposit,
  AjnaBorrowFormFieldGenerate,
} from 'features/ajna/borrow/sidebars/AjnaBorrowFormFields'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import React from 'react'

export function AjnaBorrowFormContentGenerate() {
  const {
    form: {
      dispatch,
      state: { generateAmount },
    },
  } = useAjnaBorrowContext()

  return (
    <>
      <AjnaBorrowFormFieldGenerate resetOnClear />
      <AjnaBorrowFormFieldDeposit isDisabled={!generateAmount || generateAmount?.lte(0)} />
      {generateAmount && (
        <>
          <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />
          <AjnaBorrowFormOrder />
        </>
      )}
    </>
  )
}
