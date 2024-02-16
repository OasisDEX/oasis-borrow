import { NotificationSubscriptionTypes, NotificationTypes } from 'features/deprecated/notifications/types'

export const criticalNotifications = [
  NotificationTypes.APPROACHING_LIQUIDATION,
  NotificationTypes.APPROACHING_STOP_LOSS,
  NotificationTypes.APPROACHING_AUTO_SELL,
  NotificationTypes.APPROACHING_AUTO_BUY,
  NotificationTypes.APPROACHING_CONSTANT_MULTIPLE,
  NotificationTypes.STOP_LOSS_TRIGGERED,
  NotificationTypes.AUTO_BUY_TRIGGERED,
  NotificationTypes.AUTO_SELL_TRIGGERED,
  NotificationTypes.CONSTANT_MULTIPLE_TRIGGERED,
  NotificationTypes.VAULT_LIQUIDATED,
  NotificationTypes.ORACLE_PRICE_CHANGED,
]

export const notificationPreferences = [
  {
    heading: 'notifications.action-notifications',
    description: 'notifications.action-notifications-description',
    notificationType: NotificationSubscriptionTypes.VAULT_ACTION_NOTIFICATIONS,
  },
  {
    heading: 'notifications.info-notifications',
    description: 'notifications.info-notifications-description',
    notificationType: NotificationSubscriptionTypes.VAULT_INFO_NOTIFICATIONS,
  },
  // TODO UNCOMMENTED WHEN WE WILL HAVE THESE SUBSCRIPTION TYPES IMPLEMENTED
  // {
  //   heading: 'notifications.user-communication-notifications',
  //   description: 'notifications.user-communication-notifications-description',
  //   notificationType: NotificationSubscriptionTypes.OASIS_DIRECT_NOTIFICATIONS,
  // },
  // {
  //   heading: 'notifications.news-notifications',
  //   description: 'notifications.news-notifications-description',
  //   notificationType: NotificationSubscriptionTypes.OASIS_NEWS_NOTIFICATIONS,
  // },
]

export const maxNumberOfNotifications = 50
export const firstNotificationsRelevantDate = 1658296560000
