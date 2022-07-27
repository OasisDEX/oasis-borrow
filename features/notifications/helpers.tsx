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
  vaultId,
  additionalData,
}: {
  type: NotificationTypes
  vaultId: number
  additionalData: NotificationAdditionalData
}) {
  const liquidationPrice = new BigNumber(additionalData?.liquidationPrice || 0)

  switch (type) {
    case NotificationTypes.APPROACHING_LIQUIDATION:
      return (
        <Trans
          i18nKey="notifications.approaching-liquidation"
          values={{
            vaultId: vaultId,
            liquidationPrice: formatAmount(liquidationPrice, 'USD'),
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
    if (!curr.read) {
      return acc + 1
    }
    return acc
  }, 0)
}
