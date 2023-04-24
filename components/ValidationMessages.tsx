import { MessageCard } from 'components/MessageCard'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'

export interface ValidationMessagesProps {
  messages: string[]
  type: 'error' | 'warning'
  translationRootKey: string
  additionalData?: { [key: string]: string }
}

export type ValidationMessagesInput = Pick<
  ValidationMessagesProps,
  'messages' | 'type' | 'additionalData'
>

export function ValidationMessages({
  messages,
  type,
  additionalData,
  translationRootKey,
}: ValidationMessagesProps) {
  const { t } = useTranslation()

  const messagesWithTranslations = messages.map((message) =>
    t(`${translationRootKey}.${kebabCase(message)}`, additionalData || {}),
  )

  return (
    <MessageCard messages={messagesWithTranslations} type={type} withBullet={messages.length > 1} />
  )
}
