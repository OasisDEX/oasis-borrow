import { Icon } from '@makerdao/dai-ui-icons'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import React from 'react'
import { Box, Button } from 'theme-ui'

export interface NavigationMenuOrbProps {
  icon?: string
  iconSize?: number
  isDisabled?: boolean
}

export function NavigationOrb({ icon, iconSize = 16, isDisabled }: NavigationMenuOrbProps) {
  const [isOpen, toggleIsOpen, setIsOpen] = useToggle(false)
  const ref = useOutsideElementClickHandler(() => setIsOpen(false))

  return (
    <Box ref={ref} sx={{ position: 'relative' }}>
      <Button
        variant="menuButtonRound"
        onClick={toggleIsOpen}
        disabled={isDisabled}
        sx={{
          position: 'relative',
          width: 'auto',
          minWidth: '50px',
          color: isOpen ? 'primary100' : 'neutral80',
          boxShadow: 'buttonMenu',
          transition: 'background-color 200ms',
          '&:hover': { boxShadow: 'buttonMenu' },
          ':hover': { color: 'primary100' },
        }}
      >
        {icon && <Icon name={icon} size={iconSize} sx={{ transition: 'color 200ms' }} />}
      </Button>
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          right: 0,
          mt: 1,
          backgroundColor: 'neutral10',
          boxShadow: 'buttonMenu',
          borderRadius: 'large',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-5px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 200ms, transform 200ms',
          overflowY: 'auto',
          zIndex: 1,
        }}
      >
        -
      </Box>
    </Box>
  )
}
