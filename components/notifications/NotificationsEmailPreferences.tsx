import { NotificationPreferenceCard } from 'components/notifications/NotificationPreferenceCard'
import { NotificationsChangeEmailButton } from 'components/notifications/NotificationsChangeEmailButton'
import { NotificationsSetupSuccess } from 'components/notifications/NotificationsEmailSetupSuccess'
import { useNotificationSocket } from 'components/NotificationSocketProvider'
import { NOTIFICATION_CHANGE, NotificationChange } from 'features/notifications/notificationChange'
import { NotificationChannelTypes } from 'features/notifications/types'
import { validateEmail } from 'helpers/formValidation'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Input, Text } from 'theme-ui'

interface EmailErrorProps {
  text: string
}

function EmailError({ text }: EmailErrorProps) {
  return (
    <Text
      sx={{
        fontSize: '12px',
        color: 'critical100',
        fontWeight: 600,
        px: '2px',
        mb: 2,
      }}
    >
      {text}
    </Text>
  )
}

interface NotificationsEmailPreferencesProps {
  account: string
}

export function NotificationsEmailPreferences({ account }: NotificationsEmailPreferencesProps) {
  const { t } = useTranslation()
  const { socket } = useNotificationSocket()
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)

  const initialEmail =
    notificationsState.allActiveChannels.find((item) => item.id === NotificationChannelTypes.EMAIL)
      ?.channelConfiguration || ''

  const [enableEmailPreferences, setEnableEmailPreferences] = useState(!!initialEmail)
  const [email, setEmail] = useState(initialEmail)
  const [isChanging, setIsChanging] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (initialEmail !== email) {
      setIsChanging(false)
      setSubmitted(false)
      setEmail(initialEmail)
      setEnableEmailPreferences(!!initialEmail)
    }
  }, [account, initialEmail])

  const isEmailValid = useMemo(() => validateEmail(email), [email])

  const handleIsChanging = useCallback(() => setIsChanging(true), [])

  const handleEmailToggle = useCallback(
    (isEnabled) => {
      setEnableEmailPreferences(isEnabled)
      if (!isEnabled) {
        setEmail(initialEmail)
        socket?.emit('setchannels', {
          address: account,
          channels: notificationsState.allActiveChannels.filter(
            (item) => item.id !== NotificationChannelTypes.EMAIL,
          ),
        })
      }
    },
    [socket, notificationsState],
  )

  const handleButton = useCallback(() => {
    setSubmitted(true)

    if (isEmailValid) {
      setIsChanging(false)
      const updatedChannel = notificationsState.allActiveChannels.filter(
        (item) => item.id !== NotificationChannelTypes.EMAIL,
      )

      socket?.emit('setchannels', {
        address: account,
        channels: [
          ...updatedChannel,
          { id: NotificationChannelTypes.EMAIL, channelConfiguration: email },
        ],
      })
    }
  }, [socket, notificationsState, isEmailValid])

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
            {(!initialEmail || isChanging) && (
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
                {notificationsState.error && (
                  <EmailError text={t('notifications.email-save-failure')} />
                )}
                {!isEmailValid && submitted && (
                  <EmailError text={t('notifications.invalid-email')} />
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
                  disabled={initialEmail === email}
                  onClick={handleButton}
                >
                  {t('notifications.confirm-btn')}
                </Button>
              </>
            )}
            {initialEmail && !isChanging && (
              <NotificationsChangeEmailButton
                currentEmail={email}
                handleIsChanging={handleIsChanging}
              />
            )}
          </Box>
          {initialEmail === email && submitted && !isChanging && <NotificationsSetupSuccess />}
        </Box>
      )}
    </Box>
  )
}
