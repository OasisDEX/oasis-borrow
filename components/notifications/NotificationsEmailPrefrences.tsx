import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Box, Button, Input, Text } from 'theme-ui'

import { NotificationPrefrenceCard } from './NotificationPrefrenceCard'

export function NotificationsEmailPrefrences() {
  const { t } = useTranslation()
  const [enableEmailPrefrences, setEnableEmailPrefrences] = useState(false)

  return (
    <Box>
      <NotificationPrefrenceCard
        heading={t('notifications.enable-notifications-email-heading')}
        description={t('notifications.enable-notifications-email-description')}
        checked={enableEmailPrefrences}
        onChangeHandler={() => setEnableEmailPrefrences(!enableEmailPrefrences)}
      />

      {enableEmailPrefrences && (
        <Box
          sx={{
            px: '5px',
          }}
        >
          <Box
            sx={{
              background: 'neutral30',
              p: 3,
              borderRadius: 'medium',
            }}
          >
            <Text
              sx={{
                fontSize: 1,
                fontWeight: 'semiBold',
              }}
            >
              {t('notifications.enable-notifications-email-label')}
            </Text>
            {/* TODO: Move this to a generic UI component as it can be resued */}
            <Input
              sx={{
                border: '1px solid #EAEAEA',
                borderRadius: 'medium',
                p: '8px, 16px, 8px, 16px',
                background: 'white',
                color: 'neutral80',
                fontSize: 2,
                mt: 2,
                mb: 2,
                maxHeight: '38px',
              }}
              placeholder={t('notifications.enable-notifications-email-placeholder')}
            />
            {/* TODO: Implement the error message when hooking up logic */}
            {/* <Text
              sx={{
                fontSize: '12px',
                color: '#D94A1E',
                fontWeight:600,
                px: '2px'
              }}
            >
              Failure message
            </Text> */}

            {/* TODO: Add disabled / enabled state that changes background color */}
            <Button
              sx={{
                borderRadius: 'rounder',
                background: 'primary30',
                color: 'white',
                fontWeight: 'semiBold',
                width: '100%',
                fontSize: 1,
                maxHeight: '28px',
                lineHeight: '1',
                justifyContent: 'center',
              }}
            >
              {t('notifications.confirm-btn')}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}
