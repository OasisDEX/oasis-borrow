import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { NotificationsCenter } from 'components/notifications/NotificationsCenter'
import { getUnreadNotificationCount } from 'features/notifications/helpers'
import { NOTIFICATION_CHANGE, NotificationChange } from 'features/notifications/notificationChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

export function NotificationsOrb() {
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)
  const unreadNotificationCount = getUnreadNotificationCount(notificationsState?.allNotifications)

  return (
    <NavigationOrb
      icon="bell"
      iconSize={16}
      isDisabled={!notificationsState}
      width={380}
      {...(unreadNotificationCount > 0 && { beacon: unreadNotificationCount })}
    >
      {(isOpen) => <NotificationsCenter isOpen={isOpen} />}
    </NavigationOrb>
  )
}
