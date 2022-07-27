import { NotificationSubscriptionTypes, NotificationTypes } from 'features/notifications/types'

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
    heading: 'Vault action notifications',
    description:
      'You will be able to receive notifications when triggering Automation, Liquidation, or opening a vault.',
    notificationType: NotificationSubscriptionTypes.VAULT_ACTION_NOTIFICATIONS,
  },
  {
    heading: 'Vault info notifications',
    description:
      'Something explains users will get the latest updates if they turn on notifications',
    notificationType: NotificationSubscriptionTypes.VAULT_INFO_NOTIFICATIONS,
  },
  {
    heading: 'Oasis.app user communication notifications',
    description:
      'Something explains users will get the latest updates if they turn on notifications',
    notificationType: NotificationSubscriptionTypes.OASIS_DIRECT_NOTIFICATIONS,
  },
  {
    heading: 'Oasis.app news notifications',
    description:
      'Something explains users will get the latest updates if they turn on notifications',
    notificationType: NotificationSubscriptionTypes.OASIS_NEWS_NOTIFICATIONS,
  },
]
