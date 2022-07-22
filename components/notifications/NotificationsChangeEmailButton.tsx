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
        background: '#F3F7F9',
        height: '54px',
        alignItems: 'center',
        borderRadius: '8px',
        p: 3,
      }}
    >
      <Text
        sx={{
          fontSize: '14px',
          color: '#787A9B',
        }}
      >
        {currentEmail}
      </Text>

      <Button
        sx={{
          color: '#575CFE',
          fontSize: '14px',
          background: 'transparent',
          marginLeft: 'auto !important',
          paddingRight: 0,
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
