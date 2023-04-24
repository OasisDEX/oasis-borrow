import { CommonAnalyticsSections, NotificationsEventIds, trackingEvents } from 'analytics/analytics'
import { NotificationCard } from 'components/notifications/NotificationCard'
import { NotificationsEmptyList } from 'components/notifications/NotificationsEmptyList'
import { useNotificationSocket } from 'components/NotificationSocketProvider'
import { getNotificationTitle } from 'features/notifications/helpers'
import { NOTIFICATION_CHANGE, NotificationChange } from 'features/notifications/notificationChange'
import { NotificationTypes } from 'features/notifications/types'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

export function NotificationCardsWrapper() {
  const { socket, analyticsData } = useNotificationSocket()
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)

  const validNotifications = notificationsState.allNotifications
    .filter((item) => item.notificationType in NotificationTypes)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))

  const account = analyticsData.walletAddress

  function markReadHandler(notificationId: string) {
    socket?.emit('markread', {
      address: account,
      notificationId,
    })
    trackingEvents.notifications.buttonClick(
      NotificationsEventIds.MarkAsRead,
      CommonAnalyticsSections.NotificationCenter,
      analyticsData,
    )
  }

  function editHandler(notificationId: string, isRead: boolean) {
    !isRead && markReadHandler(notificationId)
    socket?.emit('markread', {
      address: account,
      notificationId,
    })

    trackingEvents.notifications.buttonClick(
      NotificationsEventIds.GoToVault,
      CommonAnalyticsSections.NotificationCenter,
      analyticsData,
    )
  }

  return (
    <>
      {validNotifications.length > 0 ? (
        <>
          {validNotifications.map((item) => (
            <NotificationCard
              key={item.id}
              {...item}
              title={getNotificationTitle({
                type: item.notificationType,
                timestamp: item.timestamp,
                additionalData: item.additionalData,
              })}
              markReadHandler={markReadHandler}
              editHandler={editHandler}
            />
          ))}
        </>
      ) : (
        <NotificationsEmptyList />
      )}
    </>
  )
}
