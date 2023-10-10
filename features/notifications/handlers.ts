import { NOTIFICATION_CHANGE } from 'features/notifications/notificationChange'
import type {
  NotificationChannels,
  NotificationRaw,
  NotificationSubscription,
} from 'features/notifications/types'
import type { UIChanges } from 'helpers/uiChanges.types'

export function prepareNotificationMessageHandlers(uiChanges: UIChanges) {
  return {
    numberOfNotificationsHandler: function (count: number) {
      uiChanges.publish(NOTIFICATION_CHANGE, {
        type: 'number-of-notifications',
        numberOfNotifications: count,
      })
    },
    allNotificationsHandler: function (message: { notifications: NotificationRaw[] }) {
      uiChanges.publish(NOTIFICATION_CHANGE, {
        type: 'all-notifications',
        allNotifications: message.notifications.map((item) => ({
          ...item,
          additionalData: JSON.parse(JSON.parse(item.additionalData)),
        })),
      })
    },
    allActiveSubscriptionsHandler: function (message: {
      activeSubscriptions: NotificationSubscription[]
    }) {
      uiChanges.publish(NOTIFICATION_CHANGE, {
        type: 'all-active-subscriptions',
        allActiveSubscriptions: message.activeSubscriptions,
      })
    },
    allActiveChannelsHandler: function (message: { activeChannels: NotificationChannels[] }) {
      uiChanges.publish(NOTIFICATION_CHANGE, {
        type: 'all-active-channels',
        allActiveChannels: message.activeChannels,
      })
    },
  }
}
