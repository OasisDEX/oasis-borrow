import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import type { ReactNode } from 'react'
import React, { Fragment, useEffect, useState } from 'react'
import { Box, Button, Flex, Text } from 'theme-ui'

type DetailsSectionNotificationType = 'error' | 'warning' | 'notice'

interface DetailsSectionNotificationWithAction {
  action?: () => void
  url?: never
}
interface DetailsSectionNotificationWithUrl {
  action?: never
  url: string
}

export interface DetailsSectionNotificationItem {
  closable?: boolean
  icon?: string
  link?: (DetailsSectionNotificationWithAction | DetailsSectionNotificationWithUrl) & {
    translationKey: string
  }
  message?: {
    translationKey?: string
    component?: ReactNode
    params?: { [key: string]: string }
  }
  title: {
    translationKey: string
    params?: { [key: string]: string }
  }
  type?: DetailsSectionNotificationType
}

interface DetailsSectionNotificationProps {
  notifications: DetailsSectionNotificationItem[]
  onClose: (opened: number) => void
}

const notificationColors: { [key in DetailsSectionNotificationType]: string } = {
  error: 'critical100',
  notice: 'neutral80',
  warning: 'warning100',
}

function getSessionStorageKey(title: string): string {
  return `notification-${kebabCase(title)}-${document.location.pathname}`
}

export function DetailsSectionNotification({
  onClose,
  notifications,
}: DetailsSectionNotificationProps) {
  const [closedNotifications, setClosedNotifications] = useState<number[]>([])
  const { t } = useTranslation()
  notifications.forEach(({ title }, i) => {
    if (
      sessionStorage.getItem(getSessionStorageKey(title.translationKey)) === 'true' &&
      !closedNotifications.includes(i)
    )
      setClosedNotifications((prev) => [...prev, i])
  })

  useEffect(() => {
    onClose(notifications.length - closedNotifications.length)
  }, [closedNotifications])

  return (
    <Box
      as="ul"
      sx={{
        position: 'relative',
        p: 0,
        borderTopLeftRadius: 'roundish',
        borderTopRightRadius: 'roundish',
        overflow: 'hidden',
      }}
    >
      {notifications.map(({ closable, icon, link, message, title, type = 'notice' }, i) => (
        <Fragment key={getSessionStorageKey(title.translationKey)}>
          {!closedNotifications.includes(i) && (
            <Flex
              as="li"
              sx={{
                columnGap: 3,
                alignItems: 'center',
                p: 3,
                color: 'neutral10',
                bg: notificationColors[type],
              }}
            >
              {icon && (
                <Flex
                  sx={{
                    flexShrink: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 4,
                    height: 4,
                    borderRadius: 'ellipse',
                    bg: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Icon name={icon} size={20} />
                </Flex>
              )}
              <Box>
                <Text as="p" variant="boldParagraph2" sx={{ color: 'neutral10' }}>
                  {t(title.translationKey, title.params || {})}
                </Text>
                {message && (
                  <Text as="p" variant="paragraph3" sx={{ color: 'neutral10' }}>
                    {message.component}
                    {message.translationKey && t(message.translationKey, message.params || {})}
                  </Text>
                )}
              </Box>
              {(link || closable) && (
                <Flex
                  sx={{
                    alignItems: 'center',
                    flexShrink: 0,
                    columnGap: 3,
                    ml: 'auto',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {link && (
                    <>
                      {link.url && (
                        <AppLink href={link.url} sx={{ color: 'neutral10' }}>
                          {t(link.translationKey)}
                        </AppLink>
                      )}
                      {link.action && (
                        <Button
                          variant="textual"
                          sx={{ p: 0, color: 'neutral10' }}
                          onClick={link.action}
                        >
                          {t(link.translationKey)}
                        </Button>
                      )}
                    </>
                  )}
                  {closable && (
                    <Button
                      variant="unStyled"
                      sx={{ mr: 2, p: 0, lineHeight: 0 }}
                      onClick={() => {
                        sessionStorage.setItem(getSessionStorageKey(title.translationKey), 'true')
                        setClosedNotifications((prev) => [...prev, i])
                      }}
                    >
                      <Icon name="close" />
                    </Button>
                  )}
                </Flex>
              )}
            </Flex>
          )}
        </Fragment>
      ))}
    </Box>
  )
}
