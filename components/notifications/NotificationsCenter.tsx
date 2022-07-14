import { useState } from 'react';
import { theme } from 'theme';
import { Box } from 'theme-ui';
import { slideInAnimation } from 'theme/animations';
import { NotificationsCenterContent } from './NotificationsCenterContent';
import { NotificationsCenterHeader } from './NotificationsCenterHeader';

// TODO: This component should have props that look something like
// interface NotificationsCenterProps {
//   notifications: Notification[];
//   prefrences: Prefrences;
//   email: string;
//   ..ect
// }
// Rendering is then handle below

export function NotificationsCenter() {

  const [showPrefrencesTab, setShowPrefencesTab] = useState(false)

  return (
    <Box
      sx={{
        bg: 'white',
        width: 380,
        position: 'absolute',
        mt: 2,
        borderRadius: '24px',
        boxShadow: theme.shadows.vaultDetailsCard,
        p: 24,
        // TODO: Needs to be calculated but possibly be easier to get designers to adapt to this as its simpler from dev perspective & looks just as good
        right: 0,
        transition: 'transform 0.2s ease-in-out',
        transform: 'translateX(0)'
      }}
    >
      <NotificationsCenterHeader
        onButtonClick={() => setShowPrefencesTab(!showPrefrencesTab)}
        showPrefrencesTab={showPrefrencesTab}
      />
      <NotificationsCenterContent>
        <>
          {showPrefrencesTab ? <p>Prefrences</p> : <p>Notifications</p>}
        </>
      </NotificationsCenterContent>
    </Box>
  )
}