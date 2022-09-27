import { Button } from '@theme-ui/components'
import { AppLink } from 'components/Links'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { criticalNotifications } from 'features/notifications/consts'
import { Notification, NotificationTypes } from 'features/notifications/types'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useMemo } from 'react'
import { Box, Card, Flex, Text } from 'theme-ui'

function getNotificationCardSx({ isCritical, isRead }: { isCritical: boolean; isRead: boolean }) {
  return isCritical
    ? {
        boxShadow: isRead ? 'unset' : 'vaultDetailsCard',
        border: 'unset',
        '&:hover': {
          boxShadow: 'surface',
          '> div:first-child': {
            bg: 'critical100',
          },
        },
      }
    : {
        border: 'unset',
        '&:hover': {
          bg: 'neutral30',
          '> div:first-child': {
            bg: 'interactive100',
          },
        },
      }
}

function getStatusDotColor({ isRead, isCritical }: { isRead: boolean; isCritical: boolean }) {
  return isRead ? 'neutral20' : isCritical ? 'critical100' : 'interactive100'
}

function getEditVaultLinkHash(type: NotificationTypes) {
  switch (type) {
    case NotificationTypes.APPROACHING_STOP_LOSS:
    case NotificationTypes.APPROACHING_AUTO_SELL:
    case NotificationTypes.STOP_LOSS_TRIGGERED:
    case NotificationTypes.AUTO_SELL_TRIGGERED:
      return VaultViewMode.Protection
    case NotificationTypes.APPROACHING_AUTO_BUY:
    case NotificationTypes.APPROACHING_CONSTANT_MULTIPLE:
    case NotificationTypes.AUTO_BUY_TRIGGERED:
    case NotificationTypes.CONSTANT_MULTIPLE_TRIGGERED:
      return VaultViewMode.Optimization
    case NotificationTypes.VAULT_LIQUIDATED:
    case NotificationTypes.APPROACHING_LIQUIDATION:
    case NotificationTypes.ORACLE_PRICE_CHANGED:
      return VaultViewMode.Overview
    default:
      return VaultViewMode.Overview
  }
}

export type NotificationCardProps = {
  title: ReactNode
  editHandler: (id: number) => void
  markReadHandler: (id: number) => void
} & Notification

export function NotificationCard({
  id,
  title,
  lastModified,
  notificationType,
  isRead,
  editHandler,
  markReadHandler,
  additionalData,
}: NotificationCardProps) {
  const { t } = useTranslation()
  const isCritical = criticalNotifications.includes(notificationType)
  const cardSx = useMemo(() => getNotificationCardSx({ isCritical, isRead }), [
    notificationType,
    isRead,
  ])
  const linkHash = useMemo(() => getEditVaultLinkHash(notificationType), [notificationType])
  const statusDotColor = useMemo(() => getStatusDotColor({ isRead, isCritical }), [
    isRead,
    isCritical,
  ])
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  const humanDate = new Date(lastModified).toLocaleDateString('en-US', options)

  return (
    <Card sx={{ pl: '4', position: 'relative', ...cardSx }}>
      <Box
        sx={{
          position: 'absolute',
          width: '6px',
          height: '6px',
          bg: statusDotColor,
          borderRadius: '50%',
          top: '23px',
          left: '16px',
        }}
      />
      <Text as="div" variant="paragraph3" sx={{ mb: 2, fontWeight: isRead ? 'body' : 'semiBold' }}>
        {title}
      </Text>
      <Text
        as="p"
        sx={{
          mb: isCritical ? 3 : 0,
          fontSize: 1,
          color: 'text.subtitle',
        }}
      >
        {humanDate}
      </Text>
      <Flex sx={{ justifyContent: 'flex-start', gap: 2 }}>
        {additionalData.vaultId && linkHash && (
          <AppLink href={`/${additionalData.vaultId}`} hash={linkHash}>
            <Button
              variant="bean"
              sx={{ px: '24px', py: 1, height: '28px' }}
              onClick={() => editHandler(id)}
            >
              {t('go-to-vault-generic')}
            </Button>
          </AppLink>
        )}
        {isCritical && !isRead && (
          <Button
            variant="textual"
            sx={{ color: 'primary', fontSize: 1, py: 1 }}
            onClick={() => markReadHandler(id)}
          >
            {t('mark-as-read')}
          </Button>
        )}
      </Flex>
    </Card>
  )
}
