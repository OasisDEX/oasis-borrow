import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface SidebarAwaitingConfirmationProps {
  feature: string | JSX.Element
  children: JSX.Element
}

export function SidebarAwaitingConfirmation({
  feature,
  children,
}: SidebarAwaitingConfirmationProps) {
  const { t } = useTranslation()

  return (
    <>
      {typeof feature === 'string' ? (
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('automation.confirmation-text', { feature })}
        </Text>
      ) : (
        <>{feature}</>
      )}
      {children}
    </>
  )
}
