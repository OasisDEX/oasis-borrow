import { ValidationMessages, ValidationMessagesProps } from 'components/ValidationMessages'
import React from 'react'

type AutomationValidationMessagesProps = Pick<
  ValidationMessagesProps,
  'messages' | 'type' | 'additionalData'
>

export function AutomationValidationMessages({
  messages,
  type,
  additionalData,
}: AutomationValidationMessagesProps) {
  return (
    <ValidationMessages
      messages={messages}
      type={type}
      additionalData={additionalData}
      translationRootKey="automation.validation"
    />
  )
}
