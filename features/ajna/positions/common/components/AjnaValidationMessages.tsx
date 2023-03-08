import { ValidationMessages, ValidationMessagesInput } from 'components/ValidationMessages'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import React from 'react'

export function AjnaValidationMessages({
  messages,
  type,
  additionalData,
}: ValidationMessagesInput) {
  const {
    environment: { collateralToken, quoteToken },
  } = useAjnaGeneralContext()

  return (
    <ValidationMessages
      messages={messages}
      type={type}
      additionalData={{ ...additionalData, collateralToken, quoteToken }}
      translationRootKey="ajna.validations"
    />
  )
}
