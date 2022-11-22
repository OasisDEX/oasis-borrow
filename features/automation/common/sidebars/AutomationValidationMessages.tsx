import { MessageCard } from 'components/MessageCard'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface AutomationValidationMessagesProps {
  messages: string[]
  type: 'error' | 'warning'
  additionalData?: { [key: string]: string }
}

export function AutomationValidationMessages({
  messages,
  type,
  additionalData,
}: AutomationValidationMessagesProps) {
  const { t } = useTranslation()

  const messagesWithTranslations = messages.map((message) =>
    t(`automation.validation.${kebabCase(message)}`, additionalData),
  )

  return (
    <MessageCard messages={messagesWithTranslations} type={type} withBullet={messages.length > 1} />
  )
}
