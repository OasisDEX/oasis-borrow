import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Text } from 'theme-ui'

interface NotificationsChangeEmailButtonProps {
  currentEmail: string
  handleIsChanging: () => void
}

export function NotificationsChangeEmailButton({
  currentEmail,
  handleIsChanging,
}: NotificationsChangeEmailButtonProps) {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{
        background: 'neutral30',
        alignItems: 'center',
        borderRadius: 'medium',
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
          py: 0,
          ':hover': {
            background: 'transparent',
          },
        }}
        onClick={handleIsChanging}
      >
        {t('notifications.change-btn')}
      </Button>
    </Flex>
  )
}
