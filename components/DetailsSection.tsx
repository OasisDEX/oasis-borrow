import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { DetailsSectionNotification } from 'components/DetailsSectionNotification'
import type { PropsWithChildren, ReactNode } from 'react'
import React, { useState } from 'react'
import { Box, Card, Flex, Heading } from 'theme-ui'

import type { ButtonWithAction, ButtonWithActions } from './ExpandableButton'
import { ExpandableButton } from './ExpandableButton'
import { VaultTabTag } from './vault/VaultTabTag'

type DetailsSectionButtons = (ButtonWithAction | ButtonWithActions)[]

interface DetailsSectionProps {
  badge?: boolean
  buttons?: DetailsSectionButtons
  content: ReactNode
  loose?: boolean
  footer?: ReactNode
  title?: ReactNode
  notifications?: DetailsSectionNotificationItem[]
}

export function DetailsSection({
  badge,
  buttons,
  content,
  loose,
  footer,
  notifications,
  title,
}: DetailsSectionProps) {
  const [openedNotifications, setOpenedNotifications] = useState<number>(notifications?.length || 0)

  return (
    <Box>
      {notifications && (
        <DetailsSectionNotification
          notifications={notifications}
          onClose={(opened) => setOpenedNotifications(opened)}
        />
      )}
      <Card
        sx={{
          p: 0,
          border: 'lightMuted',
          ...(openedNotifications > 0 && {
            borderTop: 'none',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }),
        }}
      >
        {title && typeof title === 'string' && (
          <DetailsSectionTitle badge={badge} buttons={buttons} loose={loose}>
            {title}
          </DetailsSectionTitle>
        )}
        {title && typeof title !== 'string' && title}
        <Box
          sx={{
            px: [3, null, loose ? 4 : '24px'],
            py: loose ? 4 : '24px',
          }}
        >
          {content}
        </Box>
        {footer && (
          <Box
            sx={{
              px: [3, null, loose ? 4 : '24px'],
              py: [3, null, '24px'],
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
interface DetailsSectionTitleProps {
  badge?: boolean
  buttons?: DetailsSectionButtons
  children: ReactNode
  loose?: boolean
}

export function DetailsSectionTitle({
  badge,
  buttons,
  children,
  loose,
}: PropsWithChildren<DetailsSectionTitleProps>) {
  return (
    <Flex
      sx={{
        flexDirection: ['column', null, 'row'],
        justifyContent: 'space-between',
        mx: [3, null, loose ? 4 : '24px'],
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
          <Heading as="p" variant={loose ? 'boldParagraph1' : 'boldParagraph2'}>
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
