import type { NotificationChange } from 'features/notifications/notificationChange'
import { NOTIFICATION_CHANGE } from 'features/notifications/notificationChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Heading, Text } from 'theme-ui'

export function NotificationsEmptyList() {
  const { t } = useTranslation()
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)

  return (
    <>
      <Heading as="h3" variant="boldParagraph3">
        {t('notifications.welcome-to-notifications')}
      </Heading>
      <Text
        as="p"
        variant="paragraph3"
        sx={{
          color: 'neutral80',
        }}
      >
        {t(
          notificationsState.allActiveSubscriptions.length > 0
            ? 'notifications.zero-notifications'
            : 'notifications.zero-notifications-no-active-subscriptions',
        )}
      </Text>
    </>
  )
}
