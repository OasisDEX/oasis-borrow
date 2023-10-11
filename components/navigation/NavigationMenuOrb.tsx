import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import { AppLink } from 'components/Links'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import type { ReactNode } from 'react'
import React, { useEffect, useRef } from 'react'
import { Box, Button } from 'theme-ui'

export interface NavigationMenuOrbProps {
  beacon?: boolean | number
  children?: (isOpen: boolean) => ReactNode
  customIcon?: (isOpen: boolean) => ReactNode
  icon?: IconProps['icon']
  iconSize?: number
  isDisabled?: boolean
  link?: string
  onClick?: () => void
  onClose?: () => void
  onOpen?: () => void
  width?: number
}

interface NavigationMenuOrbIconProps {
  beacon?: boolean | number
  customIcon?: (isOpen: boolean) => ReactNode
  icon?: IconProps['icon']
  iconSize?: number
  isOpen: boolean
}

export function NavigationOrb({
  beacon,
  children,
  customIcon,
  icon,
  iconSize = 14,
  isDisabled,
  link,
  onClick,
  onClose,
  onOpen,
  width,
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
    <Box ref={ref} sx={{ position: ['static', 'relative'] }}>
      {(children || onClick) && (
        <Button
          variant="menuButtonRound"
          onClick={() => {
            toggleIsOpen()
            onClick && onClick()
          }}
          disabled={isDisabled}
          sx={{
            position: 'relative',
            width: 'auto',
            minWidth: '40px',
            height: '40px',
            p: 1,
            color: isOpen ? 'primary100' : 'neutral80',
            boxShadow: 'buttonMenu',
            transition: 'background-color 200ms',
            '&:hover': { boxShadow: 'buttonMenu' },
            ':hover': { color: 'primary100' },
          }}
        >
          <NavigationOrbIcon
            beacon={beacon}
            customIcon={customIcon}
            icon={icon}
            iconSize={iconSize}
            isOpen={isOpen}
          />
        </Button>
      )}
      {link && (
        <AppLink
          variant="buttons.menuButtonRound"
          href={link}
          sx={{
            position: 'relative',
            width: '40px',
            height: '40px',
            color: isOpen ? 'primary100' : 'neutral80',
            boxShadow: 'buttonMenu',
            transition: 'background-color 200ms',
            '&:hover': { boxShadow: 'buttonMenu' },
            ':hover': { color: 'primary100' },
          }}
        >
          <NavigationOrbIcon
            beacon={beacon}
            customIcon={customIcon}
            icon={icon}
            iconSize={iconSize}
            isOpen={isOpen}
          />
        </AppLink>
      )}
      {children && (
        <Box
          sx={{
            position: 'absolute',
            top: ['auto', '100%'],
            right: [3, 0],
            left: [3, 'auto'],
            ...(width && { width: ['auto', `${width}px`] }),
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
      )}
    </Box>
  )
}

export function NavigationOrbIcon({
  beacon,
  customIcon,
  icon,
  iconSize = 16,
  isOpen,
}: NavigationMenuOrbIconProps) {
  return (
    <>
      {customIcon ? (
        <>{customIcon(isOpen)}</>
      ) : (
        <>
          {typeof beacon === 'boolean' && beacon && (
            <Box
              sx={{
                position: 'absolute',
                top: '3px',
                right: '3px',
                width: '10px',
                height: '10px',
                borderRadius: 'round',
                bg: 'interactive100',
                zIndex: 3,
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
                zIndex: 3,
              }}
            >
              {beacon}
            </Box>
          )}
          {icon && <Icon icon={icon} size={iconSize} sx={{ transition: 'color 200ms' }} />}
        </>
      )}
    </>
  )
}
