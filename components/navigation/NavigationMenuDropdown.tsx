import React from 'react'
import { Box } from 'theme-ui'

export interface NavigationMenuDropdownProps {
  arrowPosition: number
  currentPanel?: string
  isPanelOpen: boolean
  isPanelSwitched: boolean
}

export function NavigationMenuDropdown({
  arrowPosition,
  currentPanel,
  isPanelOpen,
  isPanelSwitched,
}: NavigationMenuDropdownProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        pt: 3,
        opacity: isPanelOpen ? 1 : 0,
        transform: isPanelOpen ? 'translateY(0)' : 'translateY(-5px)',
        pointerEvents: isPanelOpen ? 'auto' : 'none',
        transition: 'opacity 200ms, transform 200ms',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          borderRadius: 'large',
          bg: 'neutral10',
          boxShadow: 'buttonMenu',
          p: 4,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-6px',
            left: '-7px',
            transform: isPanelOpen ? 'translateY(0)' : 'translateY(20px)',
            transition: 'transform 200ms',
          }}
        >
          <Box
            sx={{
              width: '14px',
              height: '14px',
              borderRadius: 2,
              bg: 'neutral10',
              transform: `translateX(${arrowPosition}px) scaleY(1.3) rotate(45deg)`,
              ...(isPanelSwitched && { transition: 'transform 200ms' }),
            }}
          />
        </Box>
        Lorem ipsum dolor sit amet
      </Box>
    </Box>
  )
}
