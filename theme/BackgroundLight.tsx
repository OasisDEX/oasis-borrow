import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { Box, Image } from 'theme-ui'

export function BackgroundLight() {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        zIndex: -1,
        backgroundColor: 'white',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        <Image
          sx={{ width: '100%', minWidth: '400px' }}
          src={staticFilesRuntimeUrl('/static/img/background/background_small.svg')}
        />
      </Box>
    </Box>
  )
}
