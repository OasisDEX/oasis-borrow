import { CommonAnalyticsSections, NotificationsEventIds, trackingEvents } from 'analytics/analytics'
import { NotificationCardsWrapper } from 'components/notifications/NotificationCardsWrapper'
import { NotificationsError } from 'components/notifications/NotificationsError'
import { useNotificationSocket } from 'components/NotificationSocketProvider'
import { NOTIFICATION_CHANGE, NotificationChange } from 'features/notifications/notificationChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import { throttle } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useMemo, useState } from 'react'
import { theme } from 'theme'
import { Box, Grid } from 'theme-ui'
import { useOnMobile } from 'theme/useBreakpointIndex'

import { NotificationsCenterContent } from './NotificationsCenterContent'
import { NotificationsCenterHeader } from './NotificationsCenterHeader'
import { NotificationPreferenceCardWrapper } from './NotificationsPrefrenceCardWrapper'

export function NotificationsCenter({ isOpen }: { isOpen: boolean }) {
  const { analyticsData } = useNotificationSocket()
  const onMobile = useOnMobile()
  const [showPreferencesTab, setShowPrefencesTab] = useState(false)
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)
  const { t } = useTranslation()

  const notificationCenterStyles = useMemo(
    () => ({
      right: onMobile ? '8px' : '0',
      width: onMobile ? '95%' : 380,
    }),
    [onMobile],
  )

  useEffect(() => {
    setShowPrefencesTab(false)
  }, [analyticsData.walletAddress, isOpen])

  const handleScroll = throttle(() => {
    trackingEvents.notifications.scroll(
      NotificationsEventIds.ScrollNotificationCenter,
      CommonAnalyticsSections.NotificationCenter,
      analyticsData,
    )
  }, 500)

  return (
    <Box
      sx={{
        bg: 'white',
        position: 'absolute',
        mt: 2,
        borderRadius: 'large',
        boxShadow: theme.shadows.buttonMenu,
        pt: 2,
        px: 2,
        // TODO: Needs to be calculated but possibly be easier to get designers to adapt to this as its simpler from dev perspective & looks just as good
        ...notificationCenterStyles,
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'opacity 200ms, transform 200ms',
      }}
    >
      <NotificationsCenterHeader
        onButtonClick={() => {
          trackingEvents.notifications.buttonClick(
            NotificationsEventIds.NotificationPreferences,
            CommonAnalyticsSections.NotificationCenter,
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
