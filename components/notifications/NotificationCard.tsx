import { Button } from '@theme-ui/components'
import { BigNumber } from 'bignumber.js'
import { NotificationTypes } from 'features/notifications/types'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useMemo } from 'react'
import { Box, Card, Flex, Text } from 'theme-ui'

function getNotificationCardSx({ type, isRead }: { type: NotificationTypes; isRead: boolean }) {
  const sxProps = {
    [NotificationTypes.CRITICAL]: {
      boxShadow: isRead ? 'unset' : 'vaultDetailsCard',
      border: 'unset',
      '&:hover': {
        boxShadow: 'surface',
        '> div:first-child': {
          bg: 'critical100',
        },
      },
    },
    [NotificationTypes.NON_CRITICAL]: {
      border: 'unset',
      '&:hover': {
        bg: 'neutral30',
        '> div:first-child': {
          bg: 'interactive100',
        },
      },
    },
  }

  return sxProps[type]
}

function getStatusDotColor({ isRead, isCritical }: { isRead: boolean; isCritical: boolean }) {
  return isRead ? 'neutral20' : isCritical ? 'critical100' : 'interactive100'
}

export interface NotificationCardProps {
  title: ReactNode
  timestamp: ReactNode
  type: NotificationTypes
  isRead: boolean
  editHandler?: () => void
  markReadHandler?: () => void
  vaultId: BigNumber
}

export function NotificationCard({
  title,
  timestamp,
  type,
  isRead,
  editHandler,
  markReadHandler,
}: NotificationCardProps) {
  const { t } = useTranslation()
  const isCritical = type === NotificationTypes.CRITICAL
  const cardSx = useMemo(() => getNotificationCardSx({ type, isRead }), [type, isRead])
  const statusDotColor = useMemo(() => getStatusDotColor({ isRead, isCritical }), [
    isRead,
    isCritical,
  ])

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
      <Text as="p" variant="paragraph3" sx={{ mb: 2, fontWeight: isRead ? 'body' : 'semiBold' }}>
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
        {timestamp}
      </Text>
      {isCritical && (
        <Flex sx={{ justifyContent: 'flex-start', gap: 2 }}>
          <Button variant="bean" sx={{ px: '24px', py: 1, height: '28px' }} onClick={editHandler}>
            {t('edit-vault')}
          </Button>
          {!isRead && (
            <Button
              variant="textual"
              sx={{ color: 'primary', fontSize: 1, py: 1 }}
              onClick={markReadHandler}
            >
              {t('mark-as-read')}
            </Button>
          )}
        </Flex>
      )}
    </Card>
  )
}

export const dummyNotifications: NotificationCardProps[] = [
  {
    title: 'Vault #1234 is close to the liqudation price $15,000.00',
    timestamp: 'Mar 17, 2022',
    type: NotificationTypes.CRITICAL,
    isRead: false,
    markReadHandler: () => console.log('mark read handler - probably api call'),
    editHandler: () => console.log('edit handler - probably just redirect'),
    vaultId: new BigNumber(1234),
  },
  {
    title: 'Vault #1234 is close to the liqudation price $15,000.00',
    timestamp: 'Mar 17, 2022',
    type: NotificationTypes.CRITICAL,
    isRead: true,
    markReadHandler: () => console.log('mark read handler - probably api call'),
    editHandler: () => console.log('edit handler - probably just redirect'),
    vaultId: new BigNumber(1234),
  },
  {
    title: 'Vault #1234 is approaching  Basic Buy Trigger',
    timestamp: 'Mar 17, 2022',
    type: NotificationTypes.NON_CRITICAL,
    isRead: false,
    vaultId: new BigNumber(1234),
  },
  {
    title: 'Vault #1234 is approaching  Basic Buy Trigger',
    timestamp: 'Mar 17, 2022',
    type: NotificationTypes.NON_CRITICAL,
    isRead: true,
    vaultId: new BigNumber(1234),
  },
  {
    title: 'Vault #1234 is approaching  Basic Buy Trigger',
    timestamp: 'Mar 17, 2022',
    type: NotificationTypes.NON_CRITICAL,
    isRead: true,
    vaultId: new BigNumber(1234),
  },
  {
    title: 'Vault #1234 is close to the liqudation price $15,000.00',
    timestamp: 'Mar 17, 2022',
    type: NotificationTypes.CRITICAL,
    isRead: false,
    markReadHandler: () => console.log('mark read handler - probably api call'),
    editHandler: () => console.log('edit handler - probably just redirect'),
    vaultId: new BigNumber(1234),
  },
  {
    title: 'Vault #1234 is approaching  Basic Buy Trigger',
    timestamp: 'Mar 17, 2022',
    type: NotificationTypes.NON_CRITICAL,
    isRead: true,
    vaultId: new BigNumber(1234),
  },
  {
    title: 'Vault #1234 is approaching  Basic Buy Trigger',
    timestamp: 'Mar 17, 2022',
    type: NotificationTypes.NON_CRITICAL,
    isRead: true,
    vaultId: new BigNumber(1234),
  },
]
