export enum NotificationTypes {
  VAULT_LIQUIDATED = 1,
  AUTO_BUY_TRIGGERED = 2,
  AUTO_SELL_TRIGGERED = 3,
  STOP_LOSS_TRIGGERED = 4,
  APPROACHING_AUTO_BUY = 5,
  APPROACHING_AUTO_SELL = 6,
  APPROACHING_LIQUIDATION = 7,
  APPROACHING_STOP_LOSS = 8,
  ORACLE_PRICE_CHANGED = 9, //not existing yet
  CONSTANT_MULTIPLE_TRIGGERED = 10,
  APPROACHING_CONSTANT_MULTIPLE = 11,
}

export enum NotificationSubscriptionTypes {
  VAULT_ACTION_NOTIFICATIONS = 1,
  VAULT_INFO_NOTIFICATIONS = 2,
  // OASIS_DIRECT_NOTIFICATIONS = 3,
  // OASIS_NEWS_NOTIFICATIONS = 4,
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
  id: string
  notificationType: NotificationTypes
  lastModified: number
  timestamp: string
  isRead: boolean
}

export interface Notification extends NotificationBase {
  additionalData: NotificationAdditionalData
}

export interface NotificationRaw extends NotificationBase {
  additionalData: string
}
