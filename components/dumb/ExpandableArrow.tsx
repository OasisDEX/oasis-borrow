import React from 'react'
import { Box, SxProps } from 'theme-ui'

type ArrowDirectionType = 'up' | 'down'

export interface ExpandableArrowProps {
  size?: number
  direction: ArrowDirectionType
  sx?: SxProps
}

export function ExpandableArrow({ size = 10, direction, sx }: ExpandableArrowProps) {
  return (
    <Box
      as="span"
      sx={{
        position: 'relative',
        display: 'inline-block',
        width: '1em',
        height: '0.64705em',
        fontSize: `${size}px`,
        transform: direction === 'down' ? 'none' : 'translate(0, -0.35294em)',
        transition: 'transform 200ms',
        ...sx,
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          top: '-0.14764em',
          left: '0.41176em',
          width: '0.17647em',
          height: '0.58823em',
          borderBottom: '0.75588em solid black',
          transition: 'transform 200ms',
        },
        '&::before': {
          transform: direction === 'down' ? 'rotate(-135deg)' : 'rotate(-45deg)',
        },
        '&::after': {
          transform: direction === 'down' ? 'rotate(135deg)' : 'rotate(45deg)',
        },
      }}
    />
  )
}
