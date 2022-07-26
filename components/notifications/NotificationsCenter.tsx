import { dummyNotifications } from 'components/notifications/NotificationCard'
import { NotificationCardsWrapper } from 'components/notifications/NotificationCardsWrapper'
import React, { useMemo, useState } from 'react'
import { theme } from 'theme'
import { Box, Grid } from 'theme-ui'
import { useOnMobile } from 'theme/useBreakpointIndex'

import { NotificationsCenterContent } from './NotificationsCenterContent'
import { NotificationsCenterHeader } from './NotificationsCenterHeader'
import { NotificationPrefrenceCardWrapper } from './NotificationsPrefrenceCardWrapper'

// TODO: This component should have props that look something like
// interface NotificationsCenterProps {
//   notifications: Notification[];
//   prefrences: Prefrences;
//   email: string;
//   ..ect
// }
// Rendering is then handle below

export function NotificationsCenter({ isOpen }: { isOpen: boolean }) {
  const onMobile = useOnMobile()
  const [showPrefrencesTab, setShowPrefencesTab] = useState(false)

  const notificationCenterStyles = useMemo(
    () => ({
      right: onMobile ? '8px' : '0',
      width: onMobile ? '95%' : 380,
    }),
    [onMobile],
  )

  return (
    <Box
      sx={{
        bg: 'white',
        position: 'absolute',
        mt: 2,
        borderRadius: '24px',
        boxShadow: theme.shadows.vaultDetailsCard,
        py: 24,
        px: 3,
        // TODO: Needs to be calculated but possibly be easier to get designers to adapt to this as its simpler from dev perspective & looks just as good
        ...notificationCenterStyles,
        transition: 'transform 0.3s ease-in-out',
        transform: !isOpen ? 'translateX(400%)' : 'translateX(0)',
      }}
    >
      <NotificationsCenterHeader
        onButtonClick={() => setShowPrefencesTab(!showPrefrencesTab)}
        showPrefrencesTab={showPrefrencesTab}
      />
      <NotificationsCenterContent>
        <Grid sx={{ px: 2, mt: 3 }}>
          {showPrefrencesTab ? (
            <NotificationPrefrenceCardWrapper />
          ) : (
            <NotificationCardsWrapper notificationCards={dummyNotifications} />
          )}
        </Grid>
      </NotificationsCenterContent>
    </Box>
  )
}
