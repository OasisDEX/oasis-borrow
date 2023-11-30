import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniValidationMessagesController } from 'features/omni-kit/controllers'
import { omniMetadataSupplyHandlerGuard } from 'features/omni-kit/helpers'
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
    environment: { productType },
  } = useOmniGeneralContext()
  const {
    form: { dispatch },
    dynamicMetadata: {
      validations: { errors, notices, successes, warnings },
      handlers,
    },
  } = useOmniProductContext(productType)

  return (
    <>
      {showReset && (
        <SidebarResetButton
          clear={() => {
            dispatch({ type: 'reset' })
            omniMetadataSupplyHandlerGuard(handlers) && handlers.customReset?.()
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
