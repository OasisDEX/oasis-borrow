import React from 'react'
import { ValidationMessages, ValidationMessagesInput } from 'components/ValidationMessages'

export function AutomationValidationMessages({
  messages,
  type,
  additionalData,
}: ValidationMessagesInput) {
  return (
    <ValidationMessages
      messages={messages}
      type={type}
      additionalData={additionalData}
      translationRootKey="automation.validation"
    />
  )
}
