import { ValidationMessages, ValidationMessagesInput } from 'components/ValidationMessages'
import React from 'react'

export function AjnaValidationMessages({
  messages,
  type,
  additionalData,
}: ValidationMessagesInput) {
  return (
    <ValidationMessages
      messages={messages}
      type={type}
      additionalData={additionalData}
      translationRootKey="ajna.validations"
    />
  )
}
