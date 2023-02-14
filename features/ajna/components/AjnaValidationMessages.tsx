import { ValidationMessages, ValidationMessagesProps } from 'components/ValidationMessages'
import React from 'react'

export type AjnaValidationMessagesProps = Pick<
  ValidationMessagesProps,
  'messages' | 'type' | 'additionalData'
>

export function AjnaValidationMessages({
  messages,
  type,
  additionalData,
}: AjnaValidationMessagesProps) {
  return (
    <ValidationMessages
      messages={messages}
      type={type}
      additionalData={additionalData}
      translationRootKey="ajna.validations"
    />
  )
}
