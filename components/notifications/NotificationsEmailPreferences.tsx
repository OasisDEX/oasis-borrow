import { NotificationPreferenceCard } from 'components/notifications/NotificationPreferenceCard'
import { NotificationsChangeEmailButton } from 'components/notifications/NotificationsChangeEmailButton'
import { NotificationsSetupSuccess } from 'components/notifications/NotificationsEmailSetupSuccess'
import { useNotificationSocket } from 'components/NotificationSocketProvider'
import { NOTIFICATION_CHANGE, NotificationChange } from 'features/notifications/notificationChange'
import { NotificationChannelTypes } from 'features/notifications/types'
import { validateEmail } from 'helpers/formValidation'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useMemo, useState } from 'react'
import { Box, Button, Input, Text } from 'theme-ui'

interface NotificationsEmailPreferencesProps {
  account: string
}

export function NotificationsEmailPreferences({ account }: NotificationsEmailPreferencesProps) {
  const { t } = useTranslation()
  const { socket } = useNotificationSocket()
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)

  const defaultEmail =
    notificationsState?.allActiveChannels.find((item) => item.id === NotificationChannelTypes.EMAIL)
      ?.channelConfiguration || ''

  const [enableEmailPreferences, setEnableEmailPreferences] = useState(!!defaultEmail)
  const [email, setEmail] = useState(defaultEmail)
  const [isChanging, setIsChanging] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isEmailValid = useMemo(() => validateEmail(email), [email])

  const handleIsChanging = useCallback(() => setIsChanging(true), [])

  const handleEmailToggle = useCallback(
    (isEnabled) => {
      setEnableEmailPreferences(isEnabled)
      if (!isEnabled) {
        setEmail(defaultEmail)
        socket?.emit('setchannels', {
          address: account,
          channels: notificationsState?.allActiveChannels.filter(
            (item) => item.id !== NotificationChannelTypes.EMAIL,
          ),
        })
      }
    },
    [socket, notificationsState],
  )

  const handleButton = useCallback(() => {
    setSubmitted(true)
    socket?.emit('setchannels', {
      address: account,
      channels: [
        ...notificationsState.allActiveChannels,
        { id: NotificationChannelTypes.EMAIL, channelConfiguration: email },
      ],
    })
  }, [socket, notificationsState])

  const handleOnChange = useCallback((e) => {
    setSubmitted(false)
    setEmail(e.target.value)
  }, [])

  return (
    <Box>
      <NotificationPreferenceCard
        heading={t('notifications.enable-notifications-email-heading')}
        description={t('notifications.enable-notifications-email-description')}
        checked={enableEmailPreferences}
        onChangeHandler={handleEmailToggle}
      />

      {enableEmailPreferences && (
        <Box
          sx={{
            px: '5px',
          }}
        >
          <Box
            sx={{
              backgroundColor: 'neutral30',
              p: 3,
              borderRadius: 'medium',
            }}
          >
            {/* TODO: Move this to a generic UI component as it can be resued */}
            {isChanging ? (
              <>
                <Text
                  sx={{
                    fontSize: 1,
                    fontWeight: 'semiBold',
                  }}
                >
                  {t('notifications.enable-notifications-email-label')}
                </Text>
                <Input
                  sx={{
                    border: '1px solid',
                    borderColor: 'neutral20',
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
                  onChange={handleOnChange}
                  value={email}
                />
                {/* error types to be defined */}
                {notificationsState?.error === 'email-save-failure' && (
                  <Text
                    sx={{
                      fontSize: '12px',
                      color: '#D94A1E',
                      fontWeight: 600,
                      px: '2px',
                    }}
                  >
                    {t('notifications.email-save-failure')}
                  </Text>
                )}
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
                  disabled={!isEmailValid || defaultEmail === email}
                  onClick={handleButton}
                >
                  {t('notifications.confirm-btn')}
                </Button>
              </>
            ) : (
              <NotificationsChangeEmailButton
                currentEmail={email}
                handleIsChanging={handleIsChanging}
              />
            )}
          </Box>
          {defaultEmail === email && submitted && <NotificationsSetupSuccess />}
        </Box>
      )}
    </Box>
  )
}
