import { Icon } from 'components/Icon'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { tick } from 'theme/icons'
import { Flex, Text } from 'theme-ui'

export function NotificationsSetupSuccess() {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{
        p: 3,
        mt: 2,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'success10',
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
        <Icon icon={tick} color="success100" />
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
