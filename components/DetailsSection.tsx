import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { DetailsSectionNotification } from 'components/DetailsSectionNotification'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { useToggle } from 'helpers/useToggle'
import type { PropsWithChildren, ReactNode } from 'react'
import React, { useState } from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Card, Flex, Heading } from 'theme-ui'

import { VaultTabTag } from './vault/VaultTabTag'

interface DetailsSectionProps {
  accordion?: boolean
  accordionOpenByDefault?: boolean
  badge?: boolean
  content: ReactNode
  extra?: ReactNode
  footer?: ReactNode
  loose?: boolean
  notifications?: DetailsSectionNotificationItem[]
  title?: ReactNode
  sx?: ThemeUIStyleObject
}

export function DetailsSection({
  accordion,
  accordionOpenByDefault = false,
  badge,
  content,
  extra,
  footer,
  loose,
  notifications,
  title,
  sx,
}: DetailsSectionProps) {
  const [openedNotifications, setOpenedNotifications] = useState<number>(notifications?.length || 0)
  const [isOpen, toggleIsOpen] = useToggle(accordionOpenByDefault)

  return (
    <Box sx={sx}>
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
          <DetailsSectionTitle
            accordion={accordion}
            badge={badge}
            isOpen={isOpen}
            loose={loose}
            extra={extra}
            onClick={() => {
              if (accordion) toggleIsOpen()
            }}
          >
            {title}
          </DetailsSectionTitle>
        )}
        {title && typeof title !== 'string' && title}
        {(!accordion || (accordion && isOpen)) && (
          <>
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
          </>
        )}
      </Card>
    </Box>
  )
}
interface DetailsSectionTitleProps {
  accordion?: boolean
  badge?: boolean
  children: ReactNode
  extra?: ReactNode
  isOpen?: boolean
  loose?: boolean
  onClick?: () => void
}

export function DetailsSectionTitle({
  accordion,
  badge,
  children,
  extra,
  isOpen,
  loose,
  onClick,
}: PropsWithChildren<DetailsSectionTitleProps>) {
  return (
    <Flex
      sx={{
        flexDirection: ['column', null, 'row'],
        alignItems: 'center',
        justifyContent: 'space-between',
        mx: [3, null, loose ? 4 : '24px'],
        pt: 3,
        pb: ['24px', null, 3],
        borderBottom: !accordion || (accordion && isOpen) ? 'lightMuted' : 'none',
        cursor: accordion ? 'pointer' : 'auto',
      }}
      onClick={onClick}
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
      {extra}
      {accordion && <ExpandableArrow direction={isOpen ? 'up' : 'down'} size={14} />}
    </Flex>
  )
}
