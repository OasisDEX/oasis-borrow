export enum NotificationTypes {
  VAULT_LIQUIDATED = 'vault-liquidated',
  STOP_LOSS_TRIGGERED = 'stop-loss-triggered',
  AUTO_SELL_TRIGGERED = 'auto-sell-triggered',
  AUTO_BUY_TRIGGERED = 'auto-buy-triggered',
  ORACLE_PRICE_CHANGED = 'oracle-price-changed',
  CONSTANT_MULTIPLE_TRIGGERED = 'constant-multiple-triggered',
  APPROACHING_CONSTANT_MULTIPLE = 'approaching-constant-multiple',
  APPROACHING_LIQUIDATION = 'approaching-liquidation',
  APPROACHING_STOP_LOSS = 'approaching-stop-loss',
  APPROACHING_AUTO_SELL = 'approaching-auto-sell',
  APPROACHING_AUTO_BUY = 'approaching-auto-buy',
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

export interface Notification {
  id: number
  notificationType: NotificationTypes
  lastModified: number
  isRead: boolean
  additionalData: NotificationAdditionalData
}
