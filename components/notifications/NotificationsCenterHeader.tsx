import { Icon } from '@makerdao/dai-ui-icons'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Text } from 'theme-ui'

interface NotificationsCenterHeaderProps {
  onButtonClick: () => void
  showPreferencesTab: boolean
}

export function NotificationsCenterHeader({
  onButtonClick,
  showPreferencesTab,
}: NotificationsCenterHeaderProps) {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{
        borderBottom: '1px solid',
        borderColor: 'neutral20',
        pb: '16px',
        alignItems: 'center',
      }}
    >
      <Text
        sx={{
          flexGrow: 1,
          fontWeight: 600,
          fontSize: '18px',
        }}
      >
        {t(
          showPreferencesTab
            ? 'notifications.notifications-preferences'
            : 'notifications.notifications-center',
        )}
      </Text>

      <Button
        sx={{
          width: '40px',
          height: '40px',
          padding: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
          background: 'white',
          borderRadius: '18px',
          ':hover': {
            bg: 'neutral30',
          },
        }}
        onClick={onButtonClick}
      >
        <Icon
          name={showPreferencesTab ? 'arrow_left' : 'settings'}
          size="auto"
          width={showPreferencesTab ? '20' : '16'}
          color="neutral80"
        />
      </Button>
    </Flex>
  )
}
