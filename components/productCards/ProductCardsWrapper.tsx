import { AppSpinner } from 'helpers/AppSpinner'
import type { ReactNode } from 'react'
import React from 'react'
import { theme } from 'theme'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Flex, Grid } from 'theme-ui'
import { fadeInAnimationDelay, slideInAnimation } from 'theme/animations'

interface ProductCardWrapperProps {
  children: Array<ReactNode>
  desktopWidthOfCard?: number
  gap?: number
  sx?: ThemeUIStyleObject
}

export function ProductCardsWrapper({
  children,
  desktopWidthOfCard = 378,
  gap = theme.space[4],
  sx,
}: ProductCardWrapperProps) {
  const childrenLength = children.flat().filter(Boolean).length
  const desktopWidthOfGrid = (childrenLength - 1) * gap + childrenLength * desktopWidthOfCard

  return (
    <Grid
      columns={childrenLength > 2 ? [1, 2, 3] : [1, childrenLength, childrenLength]}
      sx={{
        position: 'relative',
        justifyItems: 'center',
        gap: `${gap}px`,
        width: ['100%', childrenLength <= 2 ? `${desktopWidthOfGrid}px` : '100%'],
        margin: '0 auto',
        ...slideInAnimation,
        animationDelay: '0s',
        ...sx,
      }}
    >
      {children
        .flat()
        .filter((item) => item)
        .map((productCard, index) => (
          <Box
            sx={{ ...fadeInAnimationDelay(Math.min(index, 3) * 0.2), width: '100%' }}
            key={index}
          >
            {productCard}
          </Box>
        ))}
    </Grid>
  )
}

export function ProductCardsLoader() {
  return (
    <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '500px' }}>
      <AppSpinner sx={{ mt: 5 }} variant="styles.spinner.large" />
    </Flex>
  )
}
