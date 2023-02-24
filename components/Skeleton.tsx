import React from 'react'
import { Box, Grid, SxStyleProp } from 'theme-ui'

type SkeletonColorTheme = 'default' | 'dark' | 'positive' | 'negative'

type SkeletonColorThemes = {
  [key in SkeletonColorTheme]: [string, string]
}

const skeletonColorTheme: SkeletonColorThemes = {
  dark: ['#dae1e4', '#ecf2f5'],
  default: ['#e6e9eb', '#f8f7f9'],
  negative: ['#ffeee9', '#fff9f7'],
  positive: ['#e7fcfa', '#f7fefd'],
}

interface SkeletonProps {
  cols?: number
  count?: number
  color?: SkeletonColorTheme
  doughnut?: string | number
  gap?: string | number
  width?: string | number
  height?: string | number
  sx?: SxStyleProp
}

function SkeletonLine({
  color = 'default',
  doughnut,
  width = '100%',
  height = 3,
  sx,
}: Omit<SkeletonProps, 'cols' | 'count' | 'gap'>) {
  const theme = skeletonColorTheme[color]

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        borderRadius: doughnut ? 'ellipse' : 'medium',
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

export function Skeleton({ cols = 1, count = 1, gap = 3, width = '100%', ...rest }: SkeletonProps) {
  const isPercentageWidth = typeof width === 'string' && width.endsWith('%')

  return (
    <Grid
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
