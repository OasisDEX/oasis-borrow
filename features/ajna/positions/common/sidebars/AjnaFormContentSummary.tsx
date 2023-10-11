import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { AjnaValidationMessages } from 'features/ajna/positions/common/components/AjnaValidationMessages'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import type { PropsWithChildren } from 'react'
import React from 'react'

interface AjnaFormContentSummaryProps {
  showReset?: boolean
}

export function AjnaFormContentSummary({
  children,
  showReset = true,
}: PropsWithChildren<AjnaFormContentSummaryProps>) {
  const {
    environment: { product },
  } = useProtocolGeneralContext()
  const {
    form: { dispatch },
    validation: { errors, notices, successes, warnings },
  } = useAjnaProductContext(product)

  return (
    <>
      {showReset && <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />}
      <AjnaValidationMessages validations={errors} type="error" />
      <AjnaValidationMessages validations={warnings} type="warning" />
      <AjnaValidationMessages validations={notices} type="notice" />
      <AjnaValidationMessages validations={successes} type="success" />
      {children}
    </>
  )
}
