import { useNotificationSocket } from 'components/context/NotificationSocketProvider'
import { NotificationPreferenceCard } from 'components/deprecated/notifications/NotificationPreferenceCard'
import { NotificationsChangeEmailButton } from 'components/deprecated/notifications/NotificationsChangeEmailButton'
import { NotificationsSetupSuccess } from 'components/deprecated/notifications/NotificationsEmailSetupSuccess'
import { NotificationsError } from 'components/deprecated/notifications/NotificationsError'
import type { NotificationChange } from 'features/deprecated/notifications/notificationChange'
import { NOTIFICATION_CHANGE } from 'features/deprecated/notifications/notificationChange'
import { NotificationChannelTypes } from 'features/deprecated/notifications/types'
import { AppSpinner } from 'helpers/AppSpinner'
import { validateEmail } from 'helpers/formValidation'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Flex, Input, Text } from 'theme-ui'

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
  const [deactivateClick, setDeactivateClick] = useState(false)

  useEffect(() => {
    if (submitted && initialEmail === email) {
      setIsChanging(false)
      setEmail(initialEmail)
      setEnableEmailPreferences(!!initialEmail)
    }
  }, [submitted, initialEmail, email])

  const isEmailValid = useMemo(() => validateEmail(email), [email])

  const handleIsChanging = useCallback(() => setIsChanging(true), [])

  const handleEmailToggle = useCallback(
    (isEnabled) => {
      setEnableEmailPreferences(isEnabled)
      setDeactivateClick(false)
      setSubmitted(false)

      if (!isEnabled) {
        setDeactivateClick(true)
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

  const isLoading = initialEmail !== email && submitted && !!isEmailValid
  const isLoadingDeactivate = initialEmail !== '' && deactivateClick

  return (
    <Box>
      <NotificationPreferenceCard
        heading={t('notifications.enable-notifications-email-heading')}
        description={t('notifications.enable-notifications-email-description')}
        checked={enableEmailPreferences}
        onChangeHandler={handleEmailToggle}
        isLoading={isLoadingDeactivate}
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
                  placeholder={t('notifications.enable-notifications-email-placeholder') as string}
                  onChange={handleOnChange}
                  value={email}
                />
                {notificationsState.error && (
                  <NotificationsError text={t('notifications.email-save-failure')} />
                )}
                {!isEmailValid && submitted && (
                  <NotificationsError text={t('notifications.invalid-email')} />
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
                  disabled={initialEmail === email || isLoading}
                  onClick={handleButton}
                >
                  <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
                    {t('notifications.confirm-btn')}
                    {isLoading && <AppSpinner sx={{ color: 'white', ml: 2 }} />}
                  </Flex>
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
