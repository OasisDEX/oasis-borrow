import React, { ReactNode } from 'react'
import { Box, SxStyleProp } from 'theme-ui'

export function InfoBadge({ children, sx }: { children: ReactNode; sx: SxStyleProp }) {
  return (
    <Box
      sx={{
        py: 1,
        px: 3,
        borderRadius: '16px',
        fontSize: 1,
        fontWeight: 'semiBold',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
