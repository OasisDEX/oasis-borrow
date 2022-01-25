import React, { ReactNode } from 'react'
import { Grid } from 'theme-ui'

import { slideInAnimation } from '../theme/animations'

interface ProductCardWrapperProps {
  cardsNumber: number
  children: ReactNode
}

export function ProductCardsWrapper({ cardsNumber, children }: ProductCardWrapperProps) {
  return (
    <Grid
      columns={cardsNumber < 2 ? 1 : [1, 2, 3]}
      sx={{ justifyItems: 'center', ...slideInAnimation }}
    >
      {children}
    </Grid>
  )
}
