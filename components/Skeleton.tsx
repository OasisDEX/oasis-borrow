import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Grid } from 'theme-ui'

type SkeletonColorTheme = 'default' | 'dark' | 'positive' | 'negative' | 'fancy'

type SkeletonColorThemes = {
  [key in SkeletonColorTheme]: [string, string]
}

const skeletonColorTheme: SkeletonColorThemes = {
  dark: ['#dae1e4', '#ecf2f5'],
  default: ['#e6e9eb', '#f8f7f9'],
  negative: ['#ffeee9', '#fff9f7'],
  positive: ['#e7fcfa', '#f7fefd'],
  fancy: ['#ccf1fc', '#fcece3'], // based on the two main summer colors: #007DA3 + #E7A77F
}

interface SkeletonProps {
  circle?: boolean
  color?: SkeletonColorTheme
  cols?: number
  count?: number
  doughnut?: string | number
  gap?: string | number
  height?: string | number
  radius?: string
  sx?: ThemeUIStyleObject
  width?: string | number
}

export function SkeletonLine({
  circle = false,
  color = 'default',
  doughnut,
  radius = 'medium',
  width = '100%',
  height = 3,
  sx,
}: Omit<SkeletonProps, 'cols' | 'count' | 'gap'>) {
  const theme = skeletonColorTheme[color]

  return (
    <Box
      as="span"
      sx={{
        position: 'relative',
        display: 'block',
        width,
        height,
        borderRadius: circle || doughnut ? 'ellipse' : radius,
        backgroundColor: theme[0],
        overflow: 'hidden',
        ...sx,
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '300%',
          height: '100%',
          backgroundImage: `linear-gradient(90deg, ${theme[0]} 0%, ${theme[1]} 33.3%, ${theme[1]} 66.6%, ${theme[0]} 100%)`,
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
          as="span"
          sx={{
            position: 'absolute',
            top: doughnut,
            right: doughnut,
            bottom: doughnut,
            left: doughnut,
            display: 'block',
            bg: 'neutral10',
            borderRadius: 'ellipse',
            zIndex: 1,
          }}
        />
      )}
    </Box>
  )
}

export function Skeleton({ cols = 1, count = 1, gap = 3, width = '100%', ...rest }: SkeletonProps) {
  const isPercentageWidth = typeof width === 'string' && width.endsWith('%')

  return (
    <Grid
      as="span"
      gap={gap}
      sx={{
        width: isPercentageWidth ? '100%' : width,
        gridTemplateColumns: `repeat(${cols}, ${isPercentageWidth ? '1fr' : width})`,
      }}
    >
      {[...Array(count)].map((_item, i) => (
        <SkeletonLine key={i} width={width} {...rest} />
      ))}
    </Grid>
  )
}
