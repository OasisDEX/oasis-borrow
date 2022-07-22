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
        onChangeHandler={() => {
          console.log('called')
          setEnableEmailPrefrences(!enableEmailPrefrences)
        }}
      />

      {enableEmailPrefrences && (
        <Box
          sx={{
            px: '5px',
            transition: 'all .5s ease-in-out',
          }}
        >
          <Box
            sx={{
              background: '#F3F7F9',
              p: '16px',
              borderRadius: '8px',
            }}
          >
            <Text
              sx={{
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Set up your email
            </Text>
            {/* TODO: Move this to a generic UI component as it can be resued */}
            <Input
              sx={{
                border: '1px solid #EAEAEA',
                borderRadius: '8px',
                p: '8px, 16px, 8px, 16px',
                background: 'white',
                color: '#787A9B',
                fontSize: '14px',
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
                borderRadius: '24px',
                background: '#80818A',
                color: 'white',
                fontWeight: 600,
                width: '100%',
                fontSize: '12px',
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
