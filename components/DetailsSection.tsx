import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import React, { PropsWithChildren, ReactNode } from 'react'
import { Box, Button, Card, Flex, Heading, Text } from 'theme-ui'

import { ButtonWithAction, ButtonWithActions, ExpandableButton } from './ExpandableButton'
import { VaultTabTag } from './vault/VaultTabTag'

type DetailsSectionButtons = (ButtonWithAction | ButtonWithActions)[]

interface DetailsSectionProps {
  badge?: boolean
  buttons?: DetailsSectionButtons
  content: ReactNode
  footer?: ReactNode
  title?: ReactNode
  notification?: DetailsSectionNotificationProps
}

export function DetailsSection({
  badge,
  buttons,
  content,
  footer,
  notification,
  title,
}: DetailsSectionProps) {
  return (
    <Box>
      {notification && <DetailsSectionNotification {...notification} />}
      <Card
        sx={{
          p: 0,
          border: 'lightMuted',
          ...(notification && {
            pt: 2,
            borderTop: 'none',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }),
        }}
      >
        {title && typeof title === 'string' && (
          <DetailsSectionTitle badge={badge} buttons={buttons}>
            {title}
          </DetailsSectionTitle>
        )}
        {title && typeof title !== 'string' && title}
        <Box
          sx={{
            px: [3, null, '24px'],
            py: '24px',
          }}
        >
          {content}
        </Box>
        {footer && (
          <Box
            sx={{
              p: [3, null, '24px'],
              borderTop: 'lightMuted',
            }}
          >
            {footer}
          </Box>
        )}
      </Card>
    </Box>
  )
}

interface DetailsSectionNotificationWithAction {
  action: () => void
  url?: never
}
interface DetailsSectionNotificationWithUrl {
  action?: never
  url: string
}

interface DetailsSectionNotificationProps {
  closable?: boolean
  icon?: string
  link?: (DetailsSectionNotificationWithAction | DetailsSectionNotificationWithUrl) & {
    label: string
  }
  message?: string
  title: string
}

export function DetailsSectionNotification({
  closable,
  icon,
  link,
  message,
  title,
}: DetailsSectionNotificationProps) {
  return (
    <Flex
      sx={{
        columnGap: 3,
        alignItems: 'center',
        p: 3,
        bg: 'warning100',
        borderTopLeftRadius: 'roundish',
        borderTopRightRadius: 'roundish',
        color: 'neutral10',
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
            <Button variant="unStyled" sx={{ mr: 2, p: 0, lineHeight: 0, }}>
              <Icon name="close" />
            </Button>
          )}
        </Flex>
      )}
    </Flex>
  )
}

interface DetailsSectionTitleProps {
  badge?: boolean
  buttons?: DetailsSectionButtons
  children: ReactNode
}

export function DetailsSectionTitle({
  badge,
  buttons,
  children,
}: PropsWithChildren<DetailsSectionTitleProps>) {
  return (
    <Flex
      sx={{
        flexDirection: ['column', null, 'row'],
        justifyContent: 'space-between',
        mx: [3, null, '24px'],
        pt: 3,
        pb: ['24px', null, 3],
        borderBottom: 'lightMuted',
      }}
    >
      <Flex
        sx={{
          alignItems: 'center',
          height: '40px',
        }}
      >
        {typeof children === 'string' ? (
          <Heading as="p" variant="boldParagraph2">
            {children}
          </Heading>
        ) : (
          children
        )}
        {badge !== undefined && <VaultTabTag isEnabled={badge} />}
      </Flex>
      {buttons && (
        <Flex
          sx={{
            mt: [2, null, 0],
          }}
        >
          {buttons?.map((button) => (
            <ExpandableButton button={button} key={button.label} />
          ))}
        </Flex>
      )}
    </Flex>
  )
}
