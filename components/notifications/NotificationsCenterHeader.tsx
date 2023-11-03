import { Icon } from 'components/Icon'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { arrow_left, settings } from 'theme/icons'
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
        mx: 3,
        borderBottom: '1px solid',
        borderColor: 'neutral20',
        alignItems: 'center',
      }}
    >
      <Text
        as="h2"
        sx={{
          flexGrow: 1,
          py: 3,
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
          icon={showPreferencesTab ? arrow_left : settings}
          size="auto"
          width={showPreferencesTab ? '20' : '16'}
          color="neutral80"
        />
      </Button>
    </Flex>
  )
}
