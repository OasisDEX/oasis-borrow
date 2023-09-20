import React from 'react'
import type { SxProps } from 'theme-ui'
import { Box } from 'theme-ui'

export interface ExpandablePlusProps {
  color?: string
  isOpen: boolean
  size?: number
  sx?: SxProps
}

export function ExpandablePlus({
  color = 'primary100',
  isOpen,
  size = 8,
  sx,
}: ExpandablePlusProps) {
  return (
    <Box
      as="span"
      sx={{
        position: 'relative',
        display: 'inline-block',
        width: '1em',
        height: '1em',
        fontSize: `${size}px`,
        ...sx,
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          width: '100%',
          height: '2px',
          margin: 'auto',
          bg: color,
          transition: 'transform 200ms',
        },
        '&::after': {
          transform: isOpen ? 'rotate(0deg)' : 'rotate(-180deg)',
        },
        '&::before': {
          transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
        },
      }}
    />
  )
}
