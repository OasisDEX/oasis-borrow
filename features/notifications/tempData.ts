// TODO: Remove this, just needed for place holders
import {
  Notification,
  NotificationChannels,
  NotificationChannelTypes,
  NotificationSubscription,
  NotificationSubscriptionTypes,
  NotificationTypes,
} from 'features/notifications/types'

export const dummyNotifications: Notification[] = [
  {
    id: 1,
    lastModified: 1658296560,
    notificationType: NotificationTypes.APPROACHING_LIQUIDATION,
    isRead: false,
    additionalData: { usdPrice: 15000, vaultId: 1234 },
  },
  {
    id: 2,
    lastModified: 1658296560,
    notificationType: NotificationTypes.APPROACHING_LIQUIDATION,
    isRead: true,
    additionalData: { usdPrice: 15000, vaultId: 1234 },
  },
  {
    id: 3,
    lastModified: 1658296560,
    notificationType: NotificationTypes.APPROACHING_AUTO_BUY,
    isRead: false,
    additionalData: { vaultId: 1234 },
  },
  {
    id: 4,
    lastModified: 1658296560,
    notificationType: NotificationTypes.APPROACHING_AUTO_BUY,
    isRead: true,
    additionalData: { vaultId: 1234 },
  },
  {
    id: 5,
    lastModified: 1658296560,
    notificationType: NotificationTypes.APPROACHING_AUTO_BUY,
    isRead: true,
    additionalData: { vaultId: 1234 },
  },
  {
    id: 6,
    lastModified: 1658296560,
    notificationType: NotificationTypes.APPROACHING_LIQUIDATION,
    isRead: false,
    additionalData: { usdPrice: 15000, vaultId: 1234 },
  },
  {
    id: 7,
    lastModified: 1658296560,
    notificationType: NotificationTypes.APPROACHING_AUTO_BUY,
    isRead: true,
    additionalData: { vaultId: 1234 },
  },
  {
    id: 8,
    lastModified: 1658296560,
    notificationType: NotificationTypes.APPROACHING_AUTO_BUY,
    isRead: true,
    additionalData: { vaultId: 1234 },
  },
]

export const dummySubscriptions: NotificationSubscription[] = [
  {
    id: NotificationSubscriptionTypes.VAULT_ACTION_NOTIFICATIONS,
    channelId: NotificationChannelTypes.APPLICATION,
    lastModified: 1658296560,
  },
]

export const dummyChannels: NotificationChannels[] = [
  {
    id: NotificationChannelTypes.EMAIL,
    lastModified: 1658296560,
    channelConfiguration: 'sebastian@oazo.app',
  },
]
