import type { ReactNode } from 'react'
import React from 'react'
import { Box } from 'theme-ui'

// TODO: This could be regacvtored into a scrollable component that can be reused. We do a similar thing in the scrollbar
interface NotificationsCenterContentProps {
  children: ReactNode
  onScroll?: () => void
}

const NAVIGATION_HEIGHT = 80
const GAP_COUND = 3 // navigation, notifications header, equal spacing from bottom
const DEFAULT_HEIGHT = 912

export function NotificationsCenterContent({
  onScroll,
  children,
}: NotificationsCenterContentProps) {
  return (
    <Box
      sx={{
        maxHeight: window ? window.innerHeight - NAVIGATION_HEIGHT * GAP_COUND : DEFAULT_HEIGHT,
        overflow: 'auto',

        '&::-webkit-scrollbar': {
          width: '6px',
          borderRadius: 'large',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'secondary100',
          borderRadius: 'large',
        },
        '&::-webkit-scrollbar-track': {
          my: 3,
          backgroundColor: 'secondary60',
          borderRadius: 'large',
        },
      }}
      onScroll={onScroll}
    >
      {children}
    </Box>
  )
}
