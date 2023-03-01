import React, { PropsWithChildren } from 'react'
import { Box } from 'theme-ui'
import { slideInAnimation } from 'theme/animations'

export function AnimatedWrapper({ children }: PropsWithChildren<{}>) {
  return (
    <Box
      sx={{
        flex: 1,
        ...slideInAnimation,
        position: 'relative',
      }}
    >
      {children}
    </Box>
  )
}
