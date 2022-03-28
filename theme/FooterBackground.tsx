import Image from 'next/image'
import React from 'react'
import { Box } from 'theme-ui'

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
      <Box
        sx={{
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        <Image
          layout="responsive"
          height="334px"
          width="1995px"
          src={staticFilesRuntimeUrl('/static/img/background/bottom_bg.png')}
        />
      </Box>
    </Box>
  )
}
