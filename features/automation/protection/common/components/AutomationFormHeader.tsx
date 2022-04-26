import React, { ReactNode } from 'react'

import { FormHeader } from '../../../../../components/dumb/FormHeader'

interface CommonSection {
  header: ReactNode
  description: ReactNode
}

interface AutomationFormHeaderProps {
  txProgressing?: boolean
  txSuccess?: boolean
  translations: {
    editing: CommonSection
    progressing?: CommonSection
    success?: CommonSection
  }
}

export function AutomationFormHeader({
  txProgressing,
  txSuccess,
  translations,
}: AutomationFormHeaderProps) {
  return (
    <>
      {!(txProgressing || txSuccess) && (
        <FormHeader
          header={translations.editing.header}
          description={translations.editing.description}
        />
      )}
      {txProgressing && (
        <FormHeader
          header={translations.progressing!.header}
          description={translations.progressing!.description}
          withDivider
        />
      )}
      {txSuccess && (
        <FormHeader
          header={translations.success!.header}
          description={translations.success!.description}
        />
      )}
    </>
  )
}
