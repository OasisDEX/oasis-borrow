import React, { useMemo, useState } from 'react'
import { theme } from 'theme'
import { Box } from 'theme-ui'
import { useOnMobile } from 'theme/useBreakpointIndex'

import { NotificationsCenterContent } from './NotificationsCenterContent'
import { NotificationsCenterHeader } from './NotificationsCenterHeader'

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
        p: 24,
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
        <>{showPrefrencesTab ? <p>Prefrences</p> : <p>Notifications</p>}</>
      </NotificationsCenterContent>
    </Box>
  )
}
