import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { OmniValidationMessages } from 'features/omni-kit/components/OmniValidationMessages'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import type { PropsWithChildren } from 'react'
import React from 'react'

interface OmniFormContentSummaryProps {
  showReset?: boolean
}

export function OmniFormContentSummary({
  children,
  showReset = true,
}: PropsWithChildren<OmniFormContentSummaryProps>) {
  const {
    environment: { product },
  } = useOmniGeneralContext()
  const {
    form: { dispatch },
    validation: { errors, notices, successes, warnings },
  } = useOmniProductContext(product)

  return (
    <>
      {showReset && <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />}
      <OmniValidationMessages validations={errors} type="error" />
      <OmniValidationMessages validations={warnings} type="warning" />
      <OmniValidationMessages validations={notices} type="notice" />
      <OmniValidationMessages validations={successes} type="success" />
      {children}
    </>
  )
}
