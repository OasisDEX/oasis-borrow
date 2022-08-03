import { UIChanges } from 'components/AppContext'
import { NOTIFICATION_CHANGE } from 'features/notifications/notificationChange'
import {
  Notification,
  NotificationChannels,
  NotificationSubscription,
} from 'features/notifications/types'

export function prepareNotificationMessageHandlers(uiChanges: UIChanges) {
  return {
    numberOfNotificationsHandler: function (count: number) {
      uiChanges.publish(NOTIFICATION_CHANGE, {
        type: 'number-of-notifications',
        numberOfNotifications: count,
      })
    },
    allNotificationsHandler: function (message: { notifications: Notification[] }) {
      uiChanges.publish(NOTIFICATION_CHANGE, {
        type: 'all-notifications',
        allNotifications: message.notifications,
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
