import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniValidationMessagesController } from 'features/omni-kit/controllers'
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
    dynamicMetadata,
  } = useOmniProductContext(product)

  const {
    validations: { errors, notices, successes, warnings },
    handlers: { customReset },
  } = dynamicMetadata(product)

  return (
    <>
      {showReset && (
        <SidebarResetButton
          clear={() => {
            dispatch({ type: 'reset' })
            customReset()
          }}
        />
      )}
      <OmniValidationMessagesController validations={errors} type="error" />
      <OmniValidationMessagesController validations={warnings} type="warning" />
      <OmniValidationMessagesController validations={notices} type="notice" />
      <OmniValidationMessagesController validations={successes} type="success" />
      {children}
    </>
  )
}
