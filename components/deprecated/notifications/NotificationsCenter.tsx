import { trackingEvents } from 'analytics/trackingEvents'
import { MixpanelCommonAnalyticsSections, MixpanelNotificationsEventIds } from 'analytics/types'
import { useNotificationSocket } from 'components/context/NotificationSocketProvider'
import { NotificationCardsWrapper } from 'components/deprecated/notifications/NotificationCardsWrapper'
import { NotificationsCenterContent } from 'components/deprecated/notifications/NotificationsCenterContent'
import { NotificationsCenterHeader } from 'components/deprecated/notifications/NotificationsCenterHeader'
import { NotificationsError } from 'components/deprecated/notifications/NotificationsError'
import { NotificationPreferenceCardWrapper } from 'components/deprecated/notifications/NotificationsPrefrenceCardWrapper'
import type { NotificationChange } from 'features/deprecated/notifications/notificationChange'
import { NOTIFICATION_CHANGE } from 'features/deprecated/notifications/notificationChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import { throttle } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Box, Grid } from 'theme-ui'

export function NotificationsCenter({ isOpen }: { isOpen: boolean }) {
  const { t } = useTranslation()
  const [showPreferencesTab, setShowPrefencesTab] = useState(false)
  const { analyticsData } = useNotificationSocket()
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)

  useEffect(() => {
    setShowPrefencesTab(false)
  }, [analyticsData.walletAddress, isOpen])

  const handleScroll = throttle(() => {
    trackingEvents.notifications.scroll(
      MixpanelNotificationsEventIds.ScrollNotificationCenter,
      MixpanelCommonAnalyticsSections.NotificationCenter,
      analyticsData,
    )
  }, 500)

  return (
    <Box sx={{ width: '100%' }}>
      <NotificationsCenterHeader
        onButtonClick={() => {
          trackingEvents.notifications.buttonClick(
            MixpanelNotificationsEventIds.NotificationPreferences,
            MixpanelCommonAnalyticsSections.NotificationCenter,
            analyticsData,
          )
          setShowPrefencesTab(!showPreferencesTab)
        }}
        showPreferencesTab={showPreferencesTab}
      />
      {notificationsState?.error && (
        <Box my={2}>
          <NotificationsError text={t('notifications.service-not-available')} />
        </Box>
      )}
      {!!notificationsState && (
        <NotificationsCenterContent onScroll={handleScroll}>
          <Grid as="ul" p={3} gap="12px">
            {showPreferencesTab ? (
              <NotificationPreferenceCardWrapper />
            ) : (
              <NotificationCardsWrapper />
            )}
          </Grid>
        </NotificationsCenterContent>
      )}
    </Box>
  )
}
