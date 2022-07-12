import { Icon } from '@makerdao/dai-ui-icons'
import React, { LegacyRef } from 'react'
import { Box, Button } from 'theme-ui'

interface NotificationsIconButtonProps {
  notificationsPanelOpen: boolean
  notificationsRef: LegacyRef<HTMLDivElement>
  notificationsCount: string
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
            outlineColor: 'primary',
          },
          color: notificationsPanelOpen ? 'primary' : 'lavender',
          ':hover': { color: 'primary' },
        }}
      >
        <>
          <Box
            as="span"
            sx={{
              bg: 'link',
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
          <Icon
            name="bell"
            size="auto"
            width="16"
            color={notificationsPanelOpen ? 'primary' : 'lavender'}
          />
        </>
      </Button>
    </Box>
  )
}
