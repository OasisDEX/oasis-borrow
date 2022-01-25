import React, { ReactNode } from 'react'
import { Box, Grid } from 'theme-ui'

import { fadeInAnimationDelay, slideInAnimation } from '../theme/animations'

interface ProductCardWrapperProps {
  children: Array<ReactNode>
}

export function ProductCardsWrapper({ children }: ProductCardWrapperProps) {
  const productCards = children
  return (
    <Grid
      columns={productCards.length < 2 ? 1 : [1, 2, 3]}
      sx={{ justifyItems: 'center', ...slideInAnimation, position: 'relative' }}
    >
      {React.Children.toArray(
        productCards.map((productCard, index) => (
          <Box sx={{ ...fadeInAnimationDelay(index === 0 ? 0 : 0.5) }}>{productCard}</Box>
        )),
      )}
    </Grid>
  )
}
