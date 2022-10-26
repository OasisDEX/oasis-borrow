import { Icon } from '@makerdao/dai-ui-icons'
import { CommonAnalyticsSections, NotificationsEventIds, trackingEvents } from 'analytics/analytics'
import { useNotificationSocket } from 'components/NotificationSocketProvider'
import React, { LegacyRef } from 'react'
import { Box, Button } from 'theme-ui'

import { NotificationsCenter } from './NotificationsCenter'

interface NotificationsIconButtonProps {
  notificationsPanelOpen: boolean
  notificationsRef: LegacyRef<HTMLDivElement>
  notificationsCount: number
  onButtonClick: () => void
  disabled: boolean
}

export function NotificationsIconButton({
  notificationsPanelOpen,
  notificationsCount,
  notificationsRef,
  onButtonClick,
  disabled,
}: NotificationsIconButtonProps) {
  const { analyticsData } = useNotificationSocket()

  const handleButtonClick = () => {
    onButtonClick()
    trackingEvents.notifications.buttonClick(
      NotificationsEventIds.OpenNotificationCenter,
      CommonAnalyticsSections.HeaderTabs,
      analyticsData,
    )
  }

  return (
    <Box
      sx={{
        ml: 2,
      }}
      ref={notificationsRef}
    >
      <Button
        variant="menuButtonRound"
        onClick={handleButtonClick}
        disabled={disabled}
        sx={{
          mr: 3,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          ':focus': {
            outline: '1px solid',
            outlineColor: 'primary100',
          },
          color: notificationsPanelOpen ? 'primary100' : 'neutral80',
          ':hover': { color: 'primary100' },
        }}
      >
        <>
          {notificationsCount > 0 && (
            <Box
              as="span"
              sx={{
                bg: 'interactive100',
                color: 'white',
                py: 0.5,
                px: 2,
                borderRadius: '24px',
                fontWeight: 'semiBold',
                position: 'absolute',
                top: -10,
                right: -10,
              }}
            >
              {notificationsCount}
            </Box>
          )}
          <Icon
            name="bell"
            size="auto"
            width="16"
            color={notificationsPanelOpen ? 'primary100' : 'neutral80'}
          />
        </>
      </Button>

      <NotificationsCenter isOpen={notificationsPanelOpen} />
    </Box>
  )
}
