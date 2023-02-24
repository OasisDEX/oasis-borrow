import { AppSpinner } from 'helpers/AppSpinner'
import React, { ReactNode } from 'react'
import { Box, Flex, Grid, SxStyleProp } from 'theme-ui'
import { fadeInAnimationDelay, slideInAnimation } from 'theme/animations'
import { useTheme } from 'theme/useThemeUI'

interface ProductCardWrapperProps {
  children: Array<ReactNode>
  desktopWidthOfCard?: number
  sx?: SxStyleProp
}

export function ProductCardsWrapper({
  children,
  sx,
  desktopWidthOfCard = 378,
}: ProductCardWrapperProps) {
  const { theme } = useTheme()
  const childrenLength = children.flat().filter(Boolean).length
  const gapSpace = theme.space[4]
  const desktopWidthOfGrid = (childrenLength - 1) * gapSpace + childrenLength * desktopWidthOfCard

  return (
    <Grid
      columns={childrenLength > 2 ? [1, 2, 3] : [1, childrenLength, childrenLength]}
      sx={{
        justifyItems: 'center',
        ...slideInAnimation,
        position: 'relative',
        width: ['100%', childrenLength <= 2 ? `${desktopWidthOfGrid}px` : '100%'],
        gap: `${gapSpace}px`,
        margin: '0 auto',
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
