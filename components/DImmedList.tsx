import type { WithChildren } from 'helpers/types/With.types'
import React from 'react'
import { Grid } from 'theme-ui'

export function DimmedList({ children }: WithChildren) {
  return (
    <Grid
      as="ul"
      sx={{
        p: 3,
        backgroundColor: 'neutral30',
        borderRadius: 'medium',
      }}
    >
      {children}
    </Grid>
  )
}
