import React from 'react'
import { Box } from 'theme-ui'

import { NotificationPrefrenceCard } from './NotificationPrefrenceCard'
import { NOTIFICATION_PREFRENCES_DUMMY_DATA } from './tempData'

export function NotificationPrefrenceCardWrapper() {
  return (
    <Box>
      {NOTIFICATION_PREFRENCES_DUMMY_DATA &&
        NOTIFICATION_PREFRENCES_DUMMY_DATA.map((prefrence, index) => (
          <NotificationPrefrenceCard key={index.toString()} {...prefrence} />
        ))}
    </Box>
  )
}
