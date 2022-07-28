import { BigNumber } from 'bignumber.js'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import {
  Notification,
  NotificationAdditionalData,
  NotificationTypes,
} from 'features/notifications/types'
import { formatAmount } from 'helpers/formatters/format'
import { Trans } from 'next-i18next'
import React from 'react'

function linkComponents(href: string) {
  return {
    1: <AppLink href={href} sx={{ fontSize: 2, fontWeight: 'semiBold' }} />,
    2: <WithArrow sx={{ display: 'inline', color: 'interactive100', fontWeight: 'semiBold' }} />,
  }
}

export function getNotificationTitle({
  type,
  lastModified,
  additionalData,
}: {
  type: NotificationTypes
  lastModified: number
  additionalData: NotificationAdditionalData
}) {
  const usdPrice = new BigNumber(additionalData?.usdPrice || 0)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }

  const humanDate = new Date(lastModified * 1000).toLocaleDateString('en-US', options)
  const vaultId = additionalData?.vaultId || 'n/a'

  switch (type) {
    case NotificationTypes.VAULT_LIQUIDATED:
      return (
        <Trans
          i18nKey="notifications.vault-liquidated"
          values={{
            vaultId: vaultId,
            usdPrice: formatAmount(usdPrice, 'USD'),
            humanDate,
          }}
        />
      )
    case NotificationTypes.STOP_LOSS_TRIGGERED:
      return (
        <Trans
          i18nKey="notifications.stop-loss-executed"
          values={{
            vaultId: vaultId,
            usdPrice: formatAmount(usdPrice, 'USD'),
            humanDate,
          }}
        />
      )
    case NotificationTypes.AUTO_BUY_TRIGGERED:
      return (
        <Trans
          i18nKey="notifications.auto-buy-executed"
          values={{
            vaultId: vaultId,
            usdPrice: formatAmount(usdPrice, 'USD'),
            humanDate,
          }}
        />
      )
    case NotificationTypes.AUTO_SELL_TRIGGERED:
      return (
        <Trans
          i18nKey="notifications.auto-sell-executed"
          values={{
            vaultId: vaultId,
            usdPrice: formatAmount(usdPrice, 'USD'),
            humanDate,
          }}
        />
      )
    case NotificationTypes.APPROACHING_LIQUIDATION:
      return (
        <Trans
          i18nKey="notifications.approaching-liquidation"
          values={{
            vaultId: vaultId,
            humanDate,
          }}
        />
      )
    case NotificationTypes.APPROACHING_AUTO_BUY:
      return (
        <Trans
          i18nKey="notifications.approaching-trigger"
          values={{ vaultId: vaultId, trigger: 'Auto-Buy' }}
          components={linkComponents(`/${vaultId}`)}
        />
      )
    case NotificationTypes.APPROACHING_AUTO_SELL:
      return (
        <Trans
          i18nKey="notifications.approaching-trigger"
          values={{ vaultId: vaultId, trigger: 'Auto-Sell' }}
          components={linkComponents(`/${vaultId}`)}
        />
      )
    case NotificationTypes.APPROACHING_STOP_LOSS:
      return (
        <Trans
          i18nKey="notifications.approaching-trigger"
          values={{ vaultId: vaultId, trigger: 'Stop-Loss' }}
          components={linkComponents(`/${vaultId}`)}
        />
      )
    case NotificationTypes.APPROACHING_CONSTANT_MULTIPLE:
      return (
        <Trans
          i18nKey="notifications.approaching-trigger"
          values={{ vaultId: vaultId, trigger: 'Constant-Multiple' }}
          components={linkComponents(`/${vaultId}`)}
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
