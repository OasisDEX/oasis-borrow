import React, { ReactNode } from 'react'
import { Box, Flex, Grid } from 'theme-ui'

import { AppSpinner } from '../../helpers/AppSpinner'
import { fadeInAnimationDelay, slideInAnimation } from '../../theme/animations'
import { useTheme } from '../../theme/useThemeUI'

interface ProductCardWrapperProps {
  children: Array<ReactNode>
}

export function ProductCardsWrapper({ children }: ProductCardWrapperProps) {
  const { theme } = useTheme()
  const gapSpace = theme.space[4]
  const desktopWidthOfCard = 378
  const desktopWidthOfGrid = (children.length - 1) * gapSpace + children.length * desktopWidthOfCard
  return (
    <Grid
      columns={children.length > 2 ? [1, 2, 3] : [1, children.length, children.length]}
      sx={{
        justifyItems: 'center',
        ...slideInAnimation,
        position: 'relative',
        width: ['100%', children.length <= 2 ? `${desktopWidthOfGrid}px` : '100%'],
        gap: `${gapSpace}px`,
        margin: '0 auto',
      }}
    >
      {children.map((productCard, index) => (
        <Box sx={{ ...fadeInAnimationDelay(index === 0 ? 0 : 0.5), width: '100%' }} key={index}>
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
