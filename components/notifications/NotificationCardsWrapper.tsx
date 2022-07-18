import { BigNumber } from 'bignumber.js'
import { AppLink } from 'components/Links'
import { NotificationCard, NotificationCardProps } from 'components/notifications/NotificationCard'
import { NotificationTypes } from 'features/notifications/types'
import { Trans } from 'next-i18next'
import React, { ReactNode } from 'react'

function getNotificationTitle({
  type,
  title,
  vaultId,
}: {
  type: NotificationTypes
  title: ReactNode
  vaultId: BigNumber
}) {
  const titleVariants = {
    [NotificationTypes.CRITICAL]: <>{title}</>,
    [NotificationTypes.NON_CRITICAL]: (
      <>
        {title}{' '}
        <Trans
          i18nKey="view-vault-link"
          components={[
            <AppLink
              href={`/${vaultId}`}
              sx={{ color: 'interactive100', fontWeight: 'inherit' }}
            />,
          ]}
        />
      </>
    ),
  }

  return titleVariants[type]
}

interface NotificationCardsWrapperProps {
  notificationCards: NotificationCardProps[]
}

export function NotificationCardsWrapper({ notificationCards }: NotificationCardsWrapperProps) {
  return (
    <>
      {notificationCards.map((item, idx) => (
        <NotificationCard
          key={idx}
          {...item}
          title={getNotificationTitle({
            title: item.title,
            type: item.type,
            vaultId: item.vaultId,
          })}
        />
      ))}
    </>
  )
}
