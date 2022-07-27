import { Icon } from '@makerdao/dai-ui-icons'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Text } from 'theme-ui'

export function NotificationsSetupSuccess() {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{
        p: 3,
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'success10',
        borderRadius: 'medium',
      }}
    >
      <Flex
        sx={{
          justifyContent: 'center',
          width: '50px',
          height: '50px',
          alignItems: 'center',
        }}
      >
        <Icon name="tick_green" />
      </Flex>
      <Text
        sx={{
          color: 'success100',
          fontSize: 2,
        }}
      >
        {t('notifications.email-entered')}
      </Text>
    </Flex>
  )
}
