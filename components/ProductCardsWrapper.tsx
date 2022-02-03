import React, { ReactNode } from 'react'
import { Box, Grid } from 'theme-ui'

import { fadeInAnimationDelay, slideInAnimation } from '../theme/animations'

interface ProductCardWrapperProps {
  children: Array<ReactNode>
}

export function ProductCardsWrapper({ children }: ProductCardWrapperProps) {
  return (
    <Grid
      columns={children.length < 2 ? 1 : [1, 2, 3]}
      sx={{
        justifyItems: 'center',
        ...slideInAnimation,
        position: 'relative',
        width: ['100%', children.length < 2 ? '378px' : '100%'],
        gap: 4,
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
