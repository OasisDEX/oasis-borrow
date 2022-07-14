import React, { ReactNode } from 'react'
import { Box } from 'theme-ui'

// TODO: This could be regacvtored into a scrollable component that can be reused. We do a similar thing in the scrollbar
interface NotificationsCenterContentProps {
  children: ReactNode
}

export function NotificationsCenterContent({ children }: NotificationsCenterContentProps) {
  return (
    <Box
      sx={{
        maxHeight: 912,
        overflow: 'auto',
      }}
    >
      {children}
    </Box>
  )
}
