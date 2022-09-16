export enum NotificationTypes {
  VAULT_LIQUIDATED = 1,
  STOP_LOSS_TRIGGERED = 2,
  AUTO_SELL_TRIGGERED = 3,
  AUTO_BUY_TRIGGERED = 4,
  ORACLE_PRICE_CHANGED = 5,
  CONSTANT_MULTIPLE_TRIGGERED = 6,
  APPROACHING_CONSTANT_MULTIPLE = 7,
  APPROACHING_LIQUIDATION = 8,
  APPROACHING_STOP_LOSS = 9,
  APPROACHING_AUTO_SELL = 10,
  APPROACHING_AUTO_BUY = 11,
}

export enum NotificationSubscriptionTypes {
  VAULT_ACTION_NOTIFICATIONS = 1,
  VAULT_INFO_NOTIFICATIONS = 2,
  OASIS_DIRECT_NOTIFICATIONS = 3,
  OASIS_NEWS_NOTIFICATIONS = 4,
}

export interface NotificationSubscription {
  id: NotificationSubscriptionTypes
  channelId: NotificationChannelTypes
  lastModified: number
}

export enum NotificationChannelTypes {
  APPLICATION = 1,
  EMAIL = 2,
}

export interface NotificationChannels {
  id: NotificationChannelTypes
  lastModified: number
  channelConfiguration: string
}

export interface NotificationAdditionalData {
  vaultId?: number
  usdPrice?: number
}

export interface NotificationBase {
  id: number
  notificationType: NotificationTypes
  lastModified: number
  isRead: boolean
}

export interface Notification extends NotificationBase {
  additionalData: NotificationAdditionalData
}

export interface NotificationRaw extends NotificationBase {
  additionalData: string
}
