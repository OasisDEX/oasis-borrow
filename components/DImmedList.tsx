import type { PropsWithChildren } from 'react'
import React from 'react'
import { Grid } from 'theme-ui'

export function DimmedList({ children }: PropsWithChildren<{}>) {
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
