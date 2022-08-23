import { NotificationPreferenceCard } from 'components/notifications/NotificationPreferenceCard'
import { NotificationsEmailPreferences } from 'components/notifications/NotificationsEmailPreferences'
import { useNotificationSocket } from 'components/NotificationSocketProvider'
import { notificationPreferences } from 'features/notifications/consts'
import { NOTIFICATION_CHANGE, NotificationChange } from 'features/notifications/notificationChange'
import {
  NotificationChannelTypes,
  NotificationSubscriptionTypes,
} from 'features/notifications/types'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useCallback, useEffect } from 'react'
import { Box } from 'theme-ui'

interface NotificationPreferenceCardWrapperProps {
  account: string
}

export function NotificationPreferenceCardWrapper({
  account,
}: NotificationPreferenceCardWrapperProps) {
  const { socket } = useNotificationSocket()
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)

  useEffect(() => {
    if (
      !notificationsState.allActiveChannels.find(
        (item) => item.id === NotificationChannelTypes.APPLICATION,
      )
    ) {
      socket?.emit('setchannels', {
        address: account,
        channels: [
          { id: NotificationChannelTypes.APPLICATION, channelConfiguration: '' },
          ...notificationsState.allActiveChannels,
        ],
      })
    }
  }, [])

  const subscriptionsHandler = useCallback(
    (subscriptionType: NotificationSubscriptionTypes, isEnabled: boolean) => {
      if (isEnabled) {
        socket?.emit('setsubscriptions', {
          address: account,
          subscriptionTypes: [
            ...notificationsState.allActiveSubscriptions.map((item) => item.id),
            subscriptionType,
          ],
        })
        // TODO to be removed
        socket?.emit('createdummy', {
          address: account,
        })
      } else {
        const afterSubscriptions = notificationsState.allActiveSubscriptions
          .filter((item) => item.id !== subscriptionType)
          .map((item) => item.id)

        socket?.emit('setsubscriptions', {
          address: account,
          subscriptionTypes: afterSubscriptions,
        })
      }
    },
    [socket, notificationsState],
  )

  return (
    <Box>
      <Box sx={{ pb: 3, borderBottom: '1px solid', borderColor: 'neutral20' }}>
        {notificationPreferences.map((preference) => (
          <NotificationPreferenceCard
            key={preference.notificationType}
            checked={
              !!notificationsState.allActiveSubscriptions.find(
                (item) => item.id === preference.notificationType,
              )
            }
            {...preference}
            onChangeHandler={(isEnabled) =>
              subscriptionsHandler(preference.notificationType, isEnabled)
            }
          />
        ))}
      </Box>
      <NotificationsEmailPreferences account={account} />
    </Box>
  )
}
