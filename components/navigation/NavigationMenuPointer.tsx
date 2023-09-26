import React from 'react'
import { Box } from 'theme-ui'

export interface NavigationMenuPointerProps {
  arrowPosition: number
  isPanelOpen: boolean
  isPanelSwitched: boolean
}

export function NavigationMenuPointer({
  arrowPosition,
  isPanelOpen,
  isPanelSwitched,
}: NavigationMenuPointerProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '100%',
        left: '-7px',
        mt: '3px',
        transform: isPanelOpen ? 'translateY(0)' : 'translateY(20px)',
        transition: 'transform 200ms',
        zIndex: 2,
      }}
    >
      <Box
        sx={{
          width: '14px',
          height: '14px',
          borderRadius: 2,
          bg: 'neutral10',
          transform: `translateX(${arrowPosition}px) scaleX(1.3) rotate(45deg)`,
          ...(isPanelSwitched && { transition: 'transform 200ms' }),
        }}
      />
    </Box>
  )
}
