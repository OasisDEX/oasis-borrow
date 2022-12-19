import { Icon } from '@makerdao/dai-ui-icons'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import React, { ReactNode, useEffect, useRef } from 'react'
import { Box, Button } from 'theme-ui'

export interface NavigationMenuOrbProps {
  beacon?: boolean | number
  children: (isOpen: boolean) => ReactNode
  icon?: string
  iconSize?: number
  isDisabled?: boolean
  onClose?: () => void
  onOpen?: () => void
}

export function NavigationOrb({
  beacon,
  children,
  icon,
  iconSize = 16,
  isDisabled,
  onClose,
  onOpen,
}: NavigationMenuOrbProps) {
  const [isOpen, toggleIsOpen, setIsOpen] = useToggle(false)
  const didMountRef = useRef(false)
  const ref = useOutsideElementClickHandler(() => setIsOpen(false))

  useEffect(() => {
    if (didMountRef.current) {
      if (isOpen && onOpen) onOpen()
      else if (!isOpen && onClose) onClose()
    } else didMountRef.current = true
  }, [isOpen])

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
        {typeof beacon === 'boolean' && (
          <Box
            sx={{
              position: 'absolute',
              top: '3px',
              right: '3px',
              width: '10px',
              height: '10px',
              borderRadius: 'round',
              bg: 'interactive100',
              '&::before, &::after': {
                content: '""',
                position: 'absolute',
                borderRadius: 'round',
                bg: 'interactive100',
                opacity: 0.1,
              },
              '&::before': {
                top: '-3px',
                right: '-3px',
                bottom: '-3px',
                left: '-3px',
              },
              '&::after': {
                top: '-6px',
                right: '-6px',
                bottom: '-6px',
                left: '-6px',
              },
            }}
          ></Box>
        )}
        {typeof beacon === 'number' && (
          <Box
            as="span"
            sx={{
              position: 'absolute',
              top: '-3px',
              right: '-10px',
              px: 2,
              fontWeight: 'semiBold',
              color: 'neutral10',
              borderRadius: 'rounder',
              bg: 'interactive100',
            }}
          >
            {beacon}
          </Box>
        )}
        {icon && <Icon name={icon} size={iconSize} sx={{ transition: 'color 200ms' }} />}
      </Button>
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          right: 0,
          mt: 2,
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
        {children(isOpen)}
      </Box>
    </Box>
  )
}
