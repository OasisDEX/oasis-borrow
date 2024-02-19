import { BigNumber } from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import type {
  Notification,
  NotificationAdditionalData,
} from 'features/deprecated/notifications/types'
import { NotificationTypes } from 'features/deprecated/notifications/types'
import { formatAmount } from 'helpers/formatters/format'
import { Trans } from 'next-i18next'
import React from 'react'

export function getNotificationTitle({
  type,
  timestamp,
  additionalData,
}: {
  type: NotificationTypes
  timestamp: string
  additionalData: NotificationAdditionalData
}) {
  const priceInDai = amountFromWei(new BigNumber(additionalData?.usdPrice || 0), 'DAI')
  const usdPrice = formatAmount(priceInDai, 'USD')
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }

  const humanDate = new Date(parseInt(timestamp, 10)).toLocaleDateString('en-US', options)
  const vaultId = additionalData?.vaultId || 'n/a'

  switch (type) {
    case NotificationTypes.VAULT_LIQUIDATED:
      return (
        <Trans
          i18nKey="notifications.vault-liquidated"
          values={{
            vaultId,
            usdPrice,
            humanDate,
          }}
        />
      )
    case NotificationTypes.ORACLE_PRICE_CHANGED:
      return (
        <Trans
          i18nKey="notifications.oracle-price-changed"
          values={{
            usdPrice,
            humanDate,
          }}
        />
      )
    case NotificationTypes.STOP_LOSS_TRIGGERED:
      return (
        <Trans
          i18nKey="notifications.stop-loss-executed"
          values={{
            vaultId,
            usdPrice,
            humanDate,
          }}
        />
      )
    case NotificationTypes.AUTO_BUY_TRIGGERED:
      return (
        <Trans
          i18nKey="notifications.auto-buy-executed"
          values={{
            vaultId,
            usdPrice,
            humanDate,
          }}
        />
      )
    case NotificationTypes.AUTO_SELL_TRIGGERED:
      return (
        <Trans
          i18nKey="notifications.auto-sell-executed"
          values={{
            vaultId,
            usdPrice,
            humanDate,
          }}
        />
      )
    case NotificationTypes.CONSTANT_MULTIPLE_TRIGGERED:
      return (
        <Trans
          i18nKey="notifications.constant-multiple-executed"
          values={{
            vaultId,
            usdPrice,
            humanDate,
          }}
        />
      )
    case NotificationTypes.APPROACHING_LIQUIDATION:
      return (
        <Trans
          i18nKey="notifications.approaching-liquidation"
          values={{
            vaultId,
            humanDate,
          }}
        />
      )
    case NotificationTypes.APPROACHING_AUTO_BUY:
      return (
        <Trans
          i18nKey="notifications.approaching-trigger"
          values={{ vaultId, trigger: 'Auto-Buy' }}
        />
      )
    case NotificationTypes.APPROACHING_AUTO_SELL:
      return (
        <Trans
          i18nKey="notifications.approaching-trigger"
          values={{ vaultId, trigger: 'Auto-Sell' }}
        />
      )
    case NotificationTypes.APPROACHING_STOP_LOSS:
      return (
        <Trans
          i18nKey="notifications.approaching-trigger"
          values={{ vaultId, trigger: 'Stop-Loss' }}
        />
      )
    case NotificationTypes.APPROACHING_CONSTANT_MULTIPLE:
      return (
        <Trans
          i18nKey="notifications.approaching-trigger"
          values={{ vaultId, trigger: 'Constant-Multiple' }}
        />
      )
    default:
      return <Trans i18nKey="errors.unknown" />
  }
}

export function getUnreadNotificationCount(notifications: Notification[]) {
  if (!notifications) {
    return 0
  }

  return notifications.reduce((acc, curr) => {
    if (!curr.isRead) {
      return acc + 1
    }
    return acc
  }, 0)
}
