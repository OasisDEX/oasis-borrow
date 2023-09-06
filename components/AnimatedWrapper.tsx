import React, { PropsWithChildren } from 'react'
import { slideInAnimation } from 'theme/animations'
import { Box, SxStyleProp } from 'theme-ui'

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
