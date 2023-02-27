import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { AjnaValidationMessages } from 'features/ajna/common/components/AjnaValidationMessages'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import React, { PropsWithChildren } from 'react'

export function AjnaFormContentSummary({ children }: PropsWithChildren<{}>) {
  const {
    environment: { product },
  } = useAjnaGeneralContext()
  const {
    form: { dispatch },
    validation: { errors, warnings },
  } = useAjnaProductContext(product)

  return (
    <>
      <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />
      <AjnaValidationMessages {...errors} />
      <AjnaValidationMessages {...warnings} />
      {children}
    </>
  )
}
