import React from 'react'
import { Box, Flex, Image } from 'theme-ui'

import { staticFilesRuntimeUrl } from '../helpers/staticPaths'

interface ProductBackgroundProps {
  variant: 'top' | 'bottom'
}

export function ProductBackground({ variant }: ProductBackgroundProps) {
  const variantsMap = {
    top: (
      <Box
        sx={{
          position: 'absolute',
          left: 'calc((100% - 1617px) / 2)',
          top: 0,
          right: 0,
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
          <Image src={staticFilesRuntimeUrl('/static/img/background/top_bg.png')} />
        </Box>
      </Box>
    ),
    bottom: (
      <Box
        sx={{
          position: 'absolute',
          left: 'calc((100% - 1795px) / 2)',
          bottom: 0,
          right: 0,
          backgroundColor: 'white',
          overflow: 'hidden',
          zIndex: '-1',
        }}
      >
        <Flex
          sx={{
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          <Image src={staticFilesRuntimeUrl('/static/img/background/bottom_bg.png')} />
        </Flex>
      </Box>
    ),
  }

  return variantsMap[variant]
}
