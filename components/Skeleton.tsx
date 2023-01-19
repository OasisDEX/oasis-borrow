import React from 'react'
import { Box, Grid, SxStyleProp } from 'theme-ui'

interface SkeletonProps {
  gap?: string | number
  lines?: number
  width?: string | number
  height?: string | number
  sx?: SxStyleProp
}

function SkeletonLine({ width = '100%', height = 3, sx }: Omit<SkeletonProps, 'lines' | 'gap'>) {
  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        borderRadius: 'medium',
        backgroundColor: '#e6e9eb',
        overflow: 'hidden',
        ...sx,
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '300%',
          height: '100%',
          backgroundImage:
            'linear-gradient(90deg, #e6e9eb 0%, #f8f7f9 33.3%, #f8f7f9 66.6%, #e6e9eb 100%)',
          transform: 'translateX(-100%)',
          animation: 'gradient 1.5s infinite',
          animationFillMode: 'forwards',
          animationTimingFunction: 'linear',
        },
        '@keyframes gradient': {
          '0%, 20%': {
            transform: 'translateX(-100%)',
          },
          '80%, 100%': {
            transform: 'translateX(33.3%)',
          },
        },
      }}
    />
  )
}

export function Skeleton({ lines = 1, gap = 3, ...rest }: SkeletonProps) {
  return (
    <Grid gap={gap}>
      {[...Array(lines)].map((_item, i) => (
        <SkeletonLine key={i} {...rest} />
      ))}
    </Grid>
  )
}
