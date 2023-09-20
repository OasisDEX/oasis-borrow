import type { ValidationMessagesInput } from 'components/ValidationMessages'
import { ValidationMessages } from 'components/ValidationMessages'
import React from 'react'

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
