import { NotificationsCenter } from 'components/deprecated/notifications/NotificationsCenter'
import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { getUnreadNotificationCount } from 'features/deprecated/notifications/helpers'
import type { NotificationChange } from 'features/deprecated/notifications/notificationChange'
import { NOTIFICATION_CHANGE } from 'features/deprecated/notifications/notificationChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'
import { bell } from 'theme/icons'

export function NotificationsOrb() {
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)
  const unreadNotificationCount = getUnreadNotificationCount(notificationsState?.allNotifications)

  return (
    <NavigationOrb
      icon={bell}
      isDisabled={!notificationsState}
      width={380}
      {...(unreadNotificationCount > 0 && { beacon: unreadNotificationCount })}
    >
      {(isOpen) => <NotificationsCenter isOpen={isOpen} />}
    </NavigationOrb>
  )
}
