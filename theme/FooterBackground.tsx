import React from 'react'
import { Box, Flex, Image } from 'theme-ui'

import { staticFilesRuntimeUrl } from '../helpers/staticPaths'

export function FooterBackground() {
  return (
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
  )
}
