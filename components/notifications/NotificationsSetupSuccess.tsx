import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Text } from 'theme-ui'

export function NotificationsSetupSuccess() {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{
        p: '16px',
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="12"
          fill="none"
          viewBox="0 0 14 12"
        >
          <path
            fill="#1AAB9B"
            fillRule="evenodd"
            d="M13.648.238a1 1 0 01.114 1.41l-8.5 10a1 1 0 01-1.515.01l-3.5-4a1 1 0 111.506-1.316l2.736 3.127L12.238.352a1 1 0 011.41-.114z"
            clipRule="evenodd"
          ></path>
        </svg>
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
