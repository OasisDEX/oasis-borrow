import React from 'react'
import { Box, Grid, SxStyleProp } from 'theme-ui'

interface SkeletonProps {
  cols?: number
  count?: number
  doughnut?: string | number
  gap?: string | number
  width?: string | number
  height?: string | number
  sx?: SxStyleProp
}

function SkeletonLine({
  doughnut,
  width = '100%',
  height = 3,
  sx,
}: Omit<SkeletonProps, 'cols' | 'count' | 'gap'>) {
  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        borderRadius: doughnut ? 'ellipse' : 'medium',
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
    >
      {doughnut && (
        <Box
          sx={{
            position: 'absolute',
            top: doughnut,
            right: doughnut,
            bottom: doughnut,
            left: doughnut,
            bg: 'neutral10',
            borderRadius: 'ellipse',
            zIndex: 1,
          }}
        />
      )}
    </Box>
  )
}

export function Skeleton({ cols = 1, count = 1, gap = 3, ...rest }: SkeletonProps) {
  return (
    <Grid gap={gap} sx={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {[...Array(count)].map((_item, i) => (
        <SkeletonLine key={i} {...rest} />
      ))}
    </Grid>
  )
}
