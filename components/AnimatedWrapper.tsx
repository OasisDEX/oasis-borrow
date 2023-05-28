import React, { PropsWithChildren } from 'react'
import { Box, SxStyleProp } from 'theme-ui'
import { slideInAnimation } from 'theme/animations'

export function AnimatedWrapper({ children, sx }: PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Box
      sx={{
        flex: 1,
        ...slideInAnimation,
        position: 'relative',
        zIndex: 2,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
