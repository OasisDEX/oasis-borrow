import { trackingEvents } from 'analytics/trackingEvents'
import { MixpanelCommonAnalyticsSections, MixpanelNotificationsEventIds } from 'analytics/types'
import { useNotificationSocket } from 'components/context'
import { NotificationPreferenceCard } from 'components/notifications/NotificationPreferenceCard'
import { notificationPreferences } from 'features/notifications/consts'
import type { NotificationChange } from 'features/notifications/notificationChange'
import { NOTIFICATION_CHANGE } from 'features/notifications/notificationChange'
import {
  NotificationChannelTypes,
  NotificationSubscriptionTypes,
} from 'features/notifications/types'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useCallback, useEffect } from 'react'

export function NotificationPreferenceCardWrapper() {
  const { socket, analyticsData } = useNotificationSocket()
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)

  const subscriptionTypeToAnalyticsIdMap = {
    [NotificationSubscriptionTypes.VAULT_ACTION_NOTIFICATIONS]:
      MixpanelNotificationsEventIds.VaultActionNotificationSwitch,
    [NotificationSubscriptionTypes.VAULT_INFO_NOTIFICATIONS]:
      MixpanelNotificationsEventIds.VaultInfoNotificationSwitch,
  }

  const account = analyticsData.walletAddress

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
        trackingEvents.notifications.buttonClick(
          subscriptionTypeToAnalyticsIdMap[subscriptionType],
          MixpanelCommonAnalyticsSections.NotificationPreferences,
          { ...analyticsData, notificationSwitch: 'on' },
        )
      } else {
        const afterSubscriptions = notificationsState.allActiveSubscriptions
          .filter((item) => item.id !== subscriptionType)
          .map((item) => item.id)

        socket?.emit('setsubscriptions', {
          address: account,
          subscriptionTypes: afterSubscriptions,
        })

        trackingEvents.notifications.buttonClick(
          subscriptionTypeToAnalyticsIdMap[subscriptionType],
          MixpanelCommonAnalyticsSections.NotificationPreferences,
          { ...analyticsData, notificationSwitch: 'off' },
        )
      }
    },
    [socket, notificationsState],
  )

  return (
    <>
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
      {/* TODO UNCOMMENTED WHEN E-MAIL HANDLING WILL BE HANDLED IN API*/}
      {/*<NotificationsEmailPreferences account={account} />*/}
    </>
  )
}
