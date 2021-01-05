import React from 'react'
import { Box, Grid, SxStyleProp } from 'theme-ui'

export interface TableRowProps {
  left?: JSX.Element | string
  center?: JSX.Element | string
  right?: JSX.Element | string
  sx?: SxStyleProp
  onClick?: () => any
}

export function TableRow({ left, center, right, sx, onClick }: TableRowProps) {
  return (
    <Grid
      columns={['2fr 1fr 2fr']}
      gap={0}
      sx={{
        variant: onClick ? 'styles.row.clickable' : '',
        py: 2,
        px: 3,
        fontSize: 3,
        mb: 1,
        ...sx,
      }}
      onClick={onClick || undefined}
    >
      <Box sx={{ width: '100%', textAlign: 'left' }}>{left}</Box>
      <Box sx={{ width: '100%', textAlign: 'center' }}>{center}</Box>
      <Box sx={{ width: '100%', textAlign: 'right' }}>{right}</Box>
    </Grid>
  )
}
