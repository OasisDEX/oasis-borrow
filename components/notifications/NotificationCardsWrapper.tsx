import { NotificationCard } from 'components/notifications/NotificationCard'
import { useNotificationSocket } from 'components/NotificationSocketProvider'
import { getNotificationTitle } from 'features/notifications/helpers'
import { NOTIFICATION_CHANGE, NotificationChange } from 'features/notifications/notificationChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

interface NotificationCardsWrapperProps {
  account: string
}

export function NotificationCardsWrapper({ account }: NotificationCardsWrapperProps) {
  const { socket } = useNotificationSocket()
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)

  function markReadHandler(notificationId: number) {
    socket?.emit('markread', {
      address: account,
      notificationId,
    })
  }

  function editHandler(notificationId: number) {
    markReadHandler(notificationId)
    socket?.emit('markread', {
      address: account,
      notificationId,
    })
  }

  return (
    <>
      {notificationsState.allNotifications.map((item) => (
        <NotificationCard
          key={item.id}
          {...item}
          title={getNotificationTitle({
            type: item.notificationType,
            lastModified: item.lastModified,
            additionalData: item.additionalData,
          })}
          markReadHandler={markReadHandler}
          editHandler={editHandler}
        />
      ))}
    </>
  )
}
