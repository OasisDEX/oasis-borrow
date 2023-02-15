import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import React from 'react'
import { Box, Button,  Flex,  Text } from 'theme-ui'

type DetailsSectionNotificationType = 'error' | 'warning' | 'notice'

interface DetailsSectionNotificationWithAction {
  action: () => void
  url?: never
}
interface DetailsSectionNotificationWithUrl {
  action?: never
  url: string
}

export interface DetailsSectionNotificationProps {
  closable?: boolean
  icon?: string
  link?: (DetailsSectionNotificationWithAction | DetailsSectionNotificationWithUrl) & {
    label: string
  }
  message?: string
  title: string
  type?: DetailsSectionNotificationType
}

const notificationColors: { [key in DetailsSectionNotificationType]: string } = {
  error: 'critical100',
  notice: 'neutral80',
  warning: 'warning100',
}

export function DetailsSectionNotification({
  closable,
  icon,
  link,
  message,
  title,
  type = 'notice',
}: DetailsSectionNotificationProps) {
  return (
    <Flex
      sx={{
        columnGap: 3,
        alignItems: 'center',
        p: 3,
        color: 'neutral10',
        bg: notificationColors[type],
        borderTopLeftRadius: 'roundish',
        borderTopRightRadius: 'roundish',
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
          <Icon name={icon} size={16} />
        </Flex>
      )}
      <Box>
        <Text as="p" variant="boldParagraph2" sx={{ color: 'neutral10' }}>
          {title}
        </Text>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral10' }}>
          {message}
        </Text>
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
                  {link.label}
                </AppLink>
              )}
              {link.action && (
                <Button variant="textual" sx={{ p: 0, color: 'neutral10' }} onClick={link.action}>
                  {link.label}
                </Button>
              )}
            </>
          )}
          {closable && (
            <Button variant="unStyled" sx={{ mr: 2, p: 0, lineHeight: 0 }}>
              <Icon name="close" />
            </Button>
          )}
        </Flex>
      )}
    </Flex>
  )
}
