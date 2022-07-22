import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Text } from 'theme-ui'

interface NotificationsChangeEmailButtonProps {
  currentEmail: string
}

export function NotificationsChangeEmailButton({
  currentEmail,
}: NotificationsChangeEmailButtonProps) {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{
        background: 'neutral30',
        height: '54px',
        alignItems: 'center',
        borderRadius: 'medium',
        p: 3,
      }}
    >
      <Text
        sx={{
          fontSize: 2,
          color: 'neutral80',
        }}
      >
        {currentEmail}
      </Text>

      <Button
        sx={{
          color: 'interactive100',
          fontSize: 2,
          background: 'transparent',
          ml: 'auto !important',
          pr: 0,
          ':hover': {
            background: 'transparent',
          },
        }}
      >
        {t('notifications.change-btn')}
      </Button>
    </Flex>
  )
}
