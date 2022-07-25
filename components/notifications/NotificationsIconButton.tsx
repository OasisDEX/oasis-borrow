import { Icon } from '@makerdao/dai-ui-icons'
import React, { LegacyRef } from 'react'
import { Box, Button } from 'theme-ui'

import { NotificationsCenter } from './NotificationsCenter'

interface NotificationsIconButtonProps {
  notificationsPanelOpen: boolean
  notificationsRef: LegacyRef<HTMLDivElement>
  notificationsCount: number
  onButtonClick: () => void
}

export function NotificationsIconButton({
  notificationsPanelOpen,
  notificationsCount,
  notificationsRef,
  onButtonClick,
}: NotificationsIconButtonProps) {
  return (
    <Box
      sx={{
        ml: 2,
      }}
      ref={notificationsRef}
    >
      <Button
        variant="menuButtonRound"
        onClick={onButtonClick}
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
          {notificationsCount && (
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
