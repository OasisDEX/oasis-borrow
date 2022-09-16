import { BigNumber } from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
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

function getLinkComponents(href: string) {
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
  const priceInDai = amountFromWei(new BigNumber(additionalData?.nextPrice || 0), 'DAI')
  const usdPrice = formatAmount(priceInDai, 'USD')
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }

  const humanDate = new Date(lastModified).toLocaleDateString('en-US', options)
  const vaultId = additionalData?.vaultId || 'n/a'
  const linkComponents = getLinkComponents(`/${vaultId}`)

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
          components={linkComponents}
        />
      )
    case NotificationTypes.APPROACHING_AUTO_SELL:
      return (
        <Trans
          i18nKey="notifications.approaching-trigger"
          values={{ vaultId, trigger: 'Auto-Sell' }}
          components={linkComponents}
        />
      )
    case NotificationTypes.APPROACHING_STOP_LOSS:
      return (
        <Trans
          i18nKey="notifications.approaching-trigger"
          values={{ vaultId, trigger: 'Stop-Loss' }}
          components={linkComponents}
        />
      )
    case NotificationTypes.APPROACHING_CONSTANT_MULTIPLE:
      return (
        <Trans
          i18nKey="notifications.approaching-trigger"
          values={{ vaultId, trigger: 'Constant-Multiple' }}
          components={linkComponents}
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
