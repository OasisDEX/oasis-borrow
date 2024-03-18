import { MessageCard } from 'components/MessageCard'
import { useTranslation } from 'next-i18next'
import type { FC, ReactNode } from 'react'
import React from 'react'

interface OmniAutomationCancelNoticeProps {
  content: ReactNode
}

export const OmniAutomationCancelNotice: FC<OmniAutomationCancelNoticeProps> = ({ content }) => {
  const { t } = useTranslation()

  return (
    <MessageCard
      messages={[
        <>
          <strong>{t(`notice`)}</strong>: {content}
        </>,
      ]}
      type="warning"
      withBullet={false}
    />
  )
}
